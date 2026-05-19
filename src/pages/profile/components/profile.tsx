import React, { useEffect, useMemo, useState } from 'react'
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useAuthRouteStore } from '@/components/authRoute/stores'
import { Toast } from 'toastify-react-native'
import { useHomeStore } from '../../home/stores'
import { MoodType } from '../../home/types'
import type { RootStackParamList } from '@/navigation/appNavigator'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import profileService from '../services/profileService'
import profileStore from '../stores/profileStore'
import homeService from '../../home/services/homeService'
import AppBackground from '@/components/appBackground'

const Profile = () => {
  const logout = useAuthRouteStore(s => s.logout)
  const insets = useSafeAreaInsets()
  const moodConfig = useHomeStore(s => s.moodConfig)
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const userInfo = profileStore(s => s.userInfo)
  const setUserInfo = profileStore(s => s.setUserInfo)
  const [remoteStats, setRemoteStats] = useState<{
    fine: number
    struggling: number
    bad: number
  } | null>(null)
  const [remoteHistory, setRemoteHistory] = useState<
    { mood: string; checkInDateTs: number }[]
  >([])
  const [avatarError, setAvatarError] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      {
        const { status, data } = await profileService.getMe()
        if (status === 0) {
          setUserInfo(data)
          setAvatarError(false)
        }
      }
      {
        const { status, data } = await homeService.getStats()
        if (status === 0) setRemoteStats(data)
      }
      {
        const { status, data } = await homeService.getHistory({ limit: 90 })
        if (status === 0) setRemoteHistory(data?.list || [])
      }
    }
    fetchAll()
  }, [setUserInfo])

  const personality = useMemo(() => {
    const now = Date.now()
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000

    const recent = remoteHistory.filter(
      item => now - item.checkInDateTs <= sevenDaysMs,
    )
    const prev = remoteHistory.filter(
      item =>
        now - item.checkInDateTs > sevenDaysMs &&
        now - item.checkInDateTs <= fourteenDaysMs,
    )

    const calcRatio = (
      list: { mood: string }[],
    ): { fine: number; struggling: number; bad: number; total: number } => {
      const c: Record<MoodType, number> = { fine: 0, struggling: 0, bad: 0 }
      for (const item of list) {
        if (item.mood in c) c[item.mood as MoodType] += 1
      }
      const t = list.length || 1
      return {
        fine: c.fine / t,
        struggling: c.struggling / t,
        bad: c.bad / t,
        total: list.length,
      }
    }

    const cur = calcRatio(recent)
    const pre = calcRatio(prev)

    if (cur.total < 4) {
      return {
        name: '数据不足',
        description: '近 7 天打卡次数不足，先慢慢记录。',
        sampleSize: cur.total,
        trend: null,
      }
    }

    // 趋势：当前 bad 比上一周期上升/下降超过 0.15
    let trend: '好转中' | '恶化中' | null = null
    if (pre.total >= 3) {
      if (cur.bad - pre.bad >= 0.15) trend = '恶化中'
      else if (pre.bad - cur.bad >= 0.15) trend = '好转中'
    }

    const types = [
      {
        key: 'lowPoint',
        name: '低谷挣扎型',
        description: '最近状态比较沉，情绪消耗较大，需要多一点照顾自己。',
        match: () => cur.bad >= 0.25 && cur.fine < 0.2,
      },
      {
        key: 'emotionallySensitive',
        name: '情绪敏感型',
        description: '感受力强，容易被环境和事件触动，情绪起伏明显。',
        match: () => cur.bad >= 0.35,
      },
      {
        key: 'highFunctionLowBattery',
        name: '高功能低电量型',
        description: '能完成任务、很少缺席，但内心长期在消耗，需要补充能量。',
        match: () => cur.struggling >= 0.45 && cur.fine >= 0.15,
      },
      {
        key: 'stableBalancer',
        name: '稳定平衡型',
        description: '情绪相对稳定，能把生活慢慢拉回正轨，是一种内在力量。',
        match: () => cur.fine >= 0.5 && cur.bad <= 0.15,
      },
      {
        key: 'fluctuating',
        name: '波动起伏型',
        description: '三种情绪都有出现，状态在变化中，没有固定的模式。',
        match: () => cur.fine < 0.55 && cur.bad < 0.35 && cur.struggling < 0.45,
      },
    ]

    const matched = types.find(t => t.match())

    return {
      name: matched?.name ?? '波动起伏型',
      description:
        matched?.description ??
        '三种情绪都有出现，状态在变化中，没有固定的模式。',
      sampleSize: cur.total,
      trend,
    }
  }, [remoteHistory])

  const moodStats = useMemo(() => {
    const counts: Record<MoodType, number> = {
      fine: remoteStats?.fine ?? 0,
      struggling: remoteStats?.struggling ?? 0,
      bad: remoteStats?.bad ?? 0,
    }
    const total = counts.fine + counts.struggling + counts.bad
    return { counts, total }
  }, [remoteStats])

  const handleLogout = () => {
    logout()
    Toast.info('已退出登录')
  }

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() =>
            userInfo && navigation.navigate('EditProfile', { userInfo })
          }
          activeOpacity={0.8}
        >
          <View style={styles.avatar}>
            {userInfo?.avatar &&
            userInfo.avatar.trim() !== '' &&
            !avatarError ? (
              <Image
                source={{ uri: userInfo.avatar }}
                style={styles.avatarImage}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <Text style={styles.avatarText}>👤</Text>
            )}
          </View>
          <View>
            <Text style={styles.username}>
              {userInfo?.nickname || '加载中...'}
            </Text>
            <Text style={styles.editHint}>点击编辑资料 ›</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.personalityCard}>
          <Text style={styles.personalityTitle}>人格档案</Text>
          <View style={styles.personalityNameRow}>
            <Text style={styles.personalityName}>{personality.name}</Text>
            {personality.trend && (
              <View
                style={[
                  styles.trendBadge,
                  {
                    backgroundColor:
                      personality.trend === '好转中' ? '#E8F5E9' : '#FFEBEE',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.trendText,
                    {
                      color:
                        personality.trend === '好转中' ? '#2E7D32' : '#C62828',
                    },
                  ]}
                >
                  {personality.trend === '好转中' ? '↑ ' : '↓ '}
                  {personality.trend}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.personalityDesc}>{personality.description}</Text>
          <Text style={styles.personalityMeta}>
            样本：近 7 天 {personality.sampleSize} 次
          </Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>情绪统计</Text>
          <Text style={styles.statsSubtitle}>
            最近 {moodStats.total} 次打卡
          </Text>

          {(Object.keys(moodConfig) as MoodType[]).map(mood => {
            const count = moodStats.counts[mood]
            const ratio = moodStats.total === 0 ? 0 : count / moodStats.total

            return (
              <View key={mood} style={styles.statsRow}>
                <View style={styles.statsLabel}>
                  <Text style={styles.statsEmoji}>
                    {moodConfig[mood].emoji}
                  </Text>
                  <Text style={styles.statsText}>{moodConfig[mood].text}</Text>
                </View>

                <View style={styles.statsBarTrack}>
                  <View
                    style={[styles.statsBarFill, { width: `${ratio * 100}%` }]}
                  />
                </View>

                <Text style={styles.statsCount}>{count}</Text>
              </View>
            )
          })}
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('MyPosts')}
          >
            <Text style={styles.menuItemText}>📝 我的帖子</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Favorites')}
          >
            <Text style={styles.menuItemText}>⭐ 收藏夹</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.menuItemText}>⚙️ 设置</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('HelpFeedback')}
          >
            <Text style={styles.menuItemText}>❓ 帮助与反馈</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>退出登录</Text>
        </TouchableOpacity>
      </ScrollView>
    </AppBackground>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 22,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  editHint: {
    fontSize: 12,
    color: '#bbb',
    marginTop: 2,
  },
  menuContainer: {
    marginBottom: 40,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 28,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statsLabel: {
    width: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statsEmoji: {
    fontSize: 14,
  },
  statsText: {
    fontSize: 13,
    color: '#333',
  },
  statsBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#f2f2f2',
    borderRadius: 6,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  statsBarFill: {
    height: '100%',
    backgroundColor: '#5B54E4',
    borderRadius: 6,
  },
  statsCount: {
    width: 28,
    textAlign: 'right',
    fontSize: 12,
    color: '#666',
  },
  personalityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 28,
  },
  personalityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  personalityName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5B54E4',
    marginBottom: 6,
  },
  personalityDesc: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
    marginBottom: 10,
  },
  personalityMeta: {
    fontSize: 12,
    color: '#666',
  },
  personalityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  menuItemArrow: {
    fontSize: 18,
    color: '#ccc',
  },
  logoutBtn: {
    backgroundColor: '#ff4757',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})

export default Profile
