import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Toast } from 'toastify-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useHomeStore } from '../stores'
import { useSettingsStore } from '../../settings/stores'
import { MoodType } from '../types'
import MoodSelector from './moodSelector'
import CheckInButton from './checkInButton'
import SameMoodCount from './sameMoodCount'
import SyncToggle from './syncToggle'
import HomeHeader from './homeHeader'
import StreakProgress from './streakProgress'
import { homeService } from '../services'
import AppBackground from '@/components/appBackground'
import { communityService } from '@/pages/community/services'

const Home: React.FC = () => {
  const {
    todayCheckedIn,
    currentMood,
    checkInStreak,
    totalCheckIn,
    sameMoodCount,
    moodConfig,
    moodHistory,
    setTodayCheckedIn,
    setCurrentMood,
    setCheckInStreak,
    setTotalCheckIn,
    setSameMoodCount,
    setMoodHistory,
    addMoodHistory,
  } = useHomeStore()

  const { syncToCommunity, toggleSyncToCommunity } = useSettingsStore()

  const [selectedMood, setSelectedMood] = useState<MoodType | null>('fine')
  const [loading, setLoading] = useState(false)
  const insets = useSafeAreaInsets()

  useEffect(() => {
    const initState = async () => {
      {
        const { status, data } = await homeService.getToday()
        if (status === 0 && data) {
          setTodayCheckedIn(true)
          setCurrentMood(data.mood as MoodType)
        }
      }
      {
        const { status, data } = await homeService.getStreak()
        if (status === 0) {
          setCheckInStreak(data?.streak || 0)
          setTotalCheckIn(data?.total || 0)
        }
      }
      {
        const { status, data } = await homeService.getHistory({ limit: 7 })
        if (status === 0 && data?.list) {
          const history = data.list.map((item: any) => ({
            mood: item.mood,
            timestamp: item.checkInDateTs || item.createDate,
            checkInDate: item.checkInDate,
          }))
          setMoodHistory(history)
        }
      }
    }
    initState()
  }, [
    setTodayCheckedIn,
    setCurrentMood,
    setCheckInStreak,
    setTotalCheckIn,
    setMoodHistory,
  ])

  const handleCheckIn = async () => {
    if (todayCheckedIn) {
      Toast.info('今天已经打过卡啦，明天再来吧 🤍')
      return
    }
    if (!selectedMood) {
      Toast.warn('请先选择今天的状态')
      return
    }

    setLoading(true)
    try {
      // 打卡
      {
        const { status, message } = await homeService.checkIn({
          mood: selectedMood,
          syncToCommunity,
        })
        if (status !== 0) {
          Toast.error(message)
          return
        }
      }

      // 更新主页状态
      const today = new Date()
      const formatDate = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      const newHistoryItem = {
        mood: selectedMood,
        timestamp: today.getTime(),
        checkInDate: formatDate(today),
      }
      setTodayCheckedIn(true)
      setCurrentMood(selectedMood)
      const newTotal = totalCheckIn + 1
      setTotalCheckIn(newTotal)
      setCheckInStreak(checkInStreak + 1)
      addMoodHistory(newHistoryItem)

      // 检测里程碑解锁
      const milestones: Record<number, string> = {
        10: '🏅 解锁徽章「十日坚持」',
        30: '🏅 解锁徽章「一月同行」',
        60: '🏅 解锁徽章「两月陶冶」',
        100: '🏅 解锁徽章「百日达人」',
      }
      if (milestones[newTotal]) {
        Toast.success(`恭喜！${milestones[newTotal]}！可在个人页查看`)
      }

      // 获取共时性数据
      {
        const { status, data, message } = await homeService.getSameMoodCount({
          mood: selectedMood,
        })
        if (status === 0) {
          setSameMoodCount(data?.count || 0)
        } else {
          Toast.error(message)
        }
      }

      // 如果开启同步，创建社区帖子
      if (syncToCommunity) {
        const moodPostData = {
          content: `📍 今日打卡\n状态：${moodConfig[selectedMood].emoji} ${moodConfig[selectedMood].text}`,
          mood: selectedMood,
          isFromCheckIn: true,
          isAnonymous: true,
        }
        const { status, message } = await communityService.createPost(
          moodPostData,
        )
        if (status === 0) {
          Toast.success('打卡成功')
        } else {
          Toast.error(message)
        }
      } else {
        Toast.success('打卡成功')
      }

      setSelectedMood('fine')
    } finally {
      setLoading(false)
    }
  }

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood)
  }

  return (
    <AppBackground style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader />

        <View style={styles.section}>
          <MoodSelector
            selectedMood={todayCheckedIn ? currentMood : selectedMood}
            onSelectMood={handleMoodSelect}
          />
        </View>

        <View style={styles.section}>
          <StreakProgress
            streak={checkInStreak}
            total={totalCheckIn}
            history={moodHistory}
          />
        </View>

        {todayCheckedIn && currentMood ? (
          <View style={styles.section}>
            <SameMoodCount count={sameMoodCount} mood={currentMood} />
          </View>
        ) : null}

        <View style={styles.section}>
          <SyncToggle
            enabled={syncToCommunity}
            onToggle={toggleSyncToCommunity}
          />
        </View>

        <View style={styles.buttonSection}>
          <CheckInButton
            onCheckIn={handleCheckIn}
            loading={loading}
            disabled={todayCheckedIn}
          />
          <Text style={styles.footerTip}>
            每一次记录，都是温柔地拥抱自己 🤍
          </Text>
        </View>
      </ScrollView>
    </AppBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 14,
  },
  buttonSection: {
    marginTop: 8,
    alignItems: 'center',
  },
  footerTip: {
    fontSize: 12,
    color: '#999',
    marginTop: 14,
    textAlign: 'center',
  },
})

export default Home
