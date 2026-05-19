import React, { useState, useCallback, useEffect } from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '@/navigation/appNavigator'
import communityService from '../../community/services/communityService'
import type { CommunityPost } from '../../community/types'
import AppBackground from '@/components/appBackground'
import { useSettingsStore } from '@/pages/settings/stores'

const moodConfig: Record<
  string,
  { emoji: string; text: string; color: string }
> = {
  fine: { emoji: '🟢', text: '还行', color: '#7DB36C' },
  struggling: { emoji: '🟡', text: '勉强', color: '#F4C44C' },
  bad: { emoji: '🔴', text: '不太好', color: '#E84C5F' },
}

type NavProp = NativeStackNavigationProp<RootStackParamList>

function formatDate(ts: number): string {
  const d = new Date(ts)
  return `${d.getMonth() + 1}-${String(d.getDate()).padStart(2, '0')}`
}

type PostCardProps = {
  item: CommunityPost
  onPress: (id: string) => void
  onDelete: (id: string) => void
}

const PostCard = React.memo(({ item, onPress, onDelete }: PostCardProps) => {
  const handlePress = useCallback(() => onPress(item.id), [item.id, onPress])
  const handleDelete = useCallback(() => onDelete(item.id), [item.id, onDelete])
  const _mood = item.mood ? moodConfig[item.mood] : null
  return (
    <TouchableOpacity
      style={styles.postCard}
      onPress={handlePress}
      activeOpacity={0.88}
    >
      <View style={styles.postTopRow}>
        <View style={styles.postTopLeft}>
          {item.isFromCheckIn && (
            <View style={styles.checkInTag}>
              <Text style={styles.checkInText}>打卡</Text>
            </View>
          )}
        </View>
        <View style={styles.postTopRight}>
          <Text style={styles.dateText}>{formatDate(item.createDate)}</Text>
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.deleteBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.deleteText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.postContent} numberOfLines={4}>
        {item.content}
      </Text>

      <View style={styles.postBottomRow}>
        <View style={styles.interactionItem}>
          <Text style={styles.interactionIcon}>🤝</Text>
          <Text style={styles.interactionCount}>{item.interactions.same}</Text>
        </View>
        <View style={styles.interactionItem}>
          <Text style={styles.interactionIcon}>🫂</Text>
          <Text style={styles.interactionCount}>{item.interactions.hug}</Text>
        </View>
        <View style={styles.interactionItem}>
          <Text style={styles.interactionIcon}>🪦</Text>
          <Text style={styles.interactionCount}>
            {item.interactions.lieDown}
          </Text>
        </View>
        <View style={styles.interactionItem}>
          <Text style={styles.interactionIcon}>💬</Text>
          <Text style={styles.interactionCount}>{item.commentCount ?? 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
})

let cachedPosts: CommunityPost[] | null = null

const MyPosts: React.FC = () => {
  const navigation = useNavigation<NavProp>()
  const insets = useSafeAreaInsets()

  const [posts, setPosts] = useState<CommunityPost[]>(cachedPosts || [])
  const [loading, setLoading] = useState(!cachedPosts)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 10
  const loadingRef = React.useRef(false)
  const appBackground = useSettingsStore(s => s.appBackground)

  useEffect(() => {
    const id = setTimeout(() => {
      if (!loadingRef.current) {
        loadPosts(1, true)
      }
    }, 300)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadPosts = useCallback(async (nextPage: number, refresh = false) => {
    if (loadingRef.current && !refresh) return
    loadingRef.current = true
    refresh ? setRefreshing(true) : setLoading(true)
    try {
      const { status, data } = await communityService.getMyPosts({
        page: nextPage,
        pageSize,
      })
      if (status !== 0) return
      const list: CommunityPost[] = data?.list || []
      if (refresh) {
        cachedPosts = list
      }
      setPosts(prev => (refresh ? list : [...prev, ...list]))
      setPage(nextPage)
      setHasMore(list.length === pageSize)
    } finally {
      loadingRef.current = false
      refresh ? setRefreshing(false) : setLoading(false)
    }
  }, [])

  const handleRefresh = useCallback(() => loadPosts(1, true), [loadPosts])

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingRef.current) loadPosts(page + 1)
  }, [hasMore, loadPosts, page])

  const handleDelete = useCallback((postId: string) => {
    Alert.alert('删除帖子', '确定要删除这条帖子吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await communityService.deletePost(postId)
            setPosts(prev => prev.filter(p => p.id !== postId))
          } catch {
            Alert.alert('删除失败', '请稍后再试')
          }
        },
      },
    ])
  }, [])

  const handleGoBack = () => navigation.goBack()
  const keyExtractor = (item: CommunityPost) => item.id

  const handlePressPost = useCallback(
    (id: string) => navigation.navigate('PostDetail', { postId: id }),
    [navigation],
  )

  const renderItem = useCallback(
    ({ item }: { item: CommunityPost }) => (
      <PostCard item={item} onPress={handlePressPost} onDelete={handleDelete} />
    ),
    [handlePressPost, handleDelete],
  )

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <View style={[styles.header, { backgroundColor: appBackground }]}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>我的帖子</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {loading && posts.length === 0 ? (
        <View style={styles.listContent}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={[styles.postCard, styles.skeletonCard]}>
              <View
                style={[
                  styles.skeletonLine,
                  { width: '40%', marginBottom: 12 },
                ]}
              />
              <View
                style={[
                  styles.skeletonLine,
                  { width: '100%', marginBottom: 8 },
                ]}
              />
              <View
                style={[styles.skeletonLine, { width: '85%', marginBottom: 8 }]}
              />
              <View style={[styles.skeletonLine, { width: '60%' }]} />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#E84C5F"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            refreshing ? null : (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={styles.emptyText}>还没有发过帖子</Text>
                <Text style={styles.emptySubText}>去社区分享你的状态吧</Text>
              </View>
            )
          }
          ListFooterComponent={
            loading && !refreshing ? (
              <ActivityIndicator color="#E84C5F" style={styles.footer} />
            ) : null
          }
          renderItem={renderItem}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={3}
          removeClippedSubviews={true}
        />
      )}
    </AppBackground>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e8e8',
  },
  backBtn: {
    width: 72,
  },
  backText: {
    fontSize: 16,
    color: '#E84C5F',
    fontWeight: '500',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
  },
  headerRightPlaceholder: {
    width: 72,
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 40,
  },
  emptyWrap: {
    paddingTop: 130,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#aaa',
  },
  emptySubText: {
    marginTop: 6,
    fontSize: 13,
    color: '#ccc',
  },
  footer: {
    paddingVertical: 20,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  moodBadge: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  moodBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  postTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  postTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  moodText: {
    fontSize: 12,
    fontWeight: '700',
  },
  checkInTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: '#FFF0F1',
    borderRadius: 20,
  },
  checkInText: {
    fontSize: 11,
    color: '#E84C5F',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#c0c0c0',
  },
  deleteBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 11,
    color: '#aaa',
    fontWeight: '700',
    lineHeight: 13,
  },
  postContent: {
    fontSize: 14,
    color: '#2c2c2c',
    lineHeight: 22,
    marginBottom: 14,
  },
  postBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#f0f0f0',
  },
  interactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  interactionIcon: {
    fontSize: 14,
  },
  interactionCount: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  skeletonCard: {
    backgroundColor: '#f5f5f5',
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#e8e8e8',
    borderRadius: 6,
  },
})

export default MyPosts
