import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Keyboard,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCommunityStore } from '../stores'
import { CommunityPost, IGetPostsParams } from '../types'
import { MoodType } from '../../home/types'
import PostItem from './postItem'
import CreatePostInput from './createPostInput'
import { communityService } from '../services'
import AppBackground from '@/components/appBackground'
import { Toast } from 'toastify-react-native'

type FilterKey = MoodType | 'all' | 'normal' | 'checkin'

const moodFilters: {
  key: FilterKey
  label: string
  emoji: string
  activeColor: string
  activeBg: string
}[] = [
  {
    key: 'all',
    label: '全部',
    emoji: '✨',
    activeColor: '#fff',
    activeBg: '#333',
  },
  {
    key: 'normal',
    label: '普通帖',
    emoji: '📝',
    activeColor: '#fff',
    activeBg: '#7C6AF5',
  },
  {
    key: 'checkin',
    label: '打卡帖',
    emoji: '📍',
    activeColor: '#fff',
    activeBg: '#E84C5F',
  },
  {
    key: 'fine',
    label: '还行',
    emoji: '🟢',
    activeColor: '#2E7D32',
    activeBg: '#E8F5E9',
  },
  {
    key: 'struggling',
    label: '勉强',
    emoji: '🟡',
    activeColor: '#F57F17',
    activeBg: '#FFF8E1',
  },
  {
    key: 'bad',
    label: '不太好',
    emoji: '🔴',
    activeColor: '#C62828',
    activeBg: '#FFEBEE',
  },
]

const Community: React.FC = () => {
  const { posts, loading, setPosts, setLoading, setError } = useCommunityStore()
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const insets = useSafeAreaInsets()
  const listRef = useRef<FlatList<CommunityPost>>(null)

  const loadPosts = useCallback(
    async (params?: IGetPostsParams) => {
      setLoading(true)
      try {
        const { status, data, message } = await communityService.getPosts(
          params,
        )
        console.log('获取的响应数据', data)
        if (status === 0) {
          setPosts(data?.list || [])
        }
      } catch {
        setError('加载失败')
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setPosts, setError],
  )

  useEffect(() => {
    loadPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const buildFilterParams = (key: FilterKey) => {
    if (key === 'all') return {}
    if (key === 'normal') return { isFromCheckIn: false }
    if (key === 'checkin') return { isFromCheckIn: true }
    return { mood: key }
  }

  const handleRefresh = () => {
    loadPosts(buildFilterParams(selectedFilter))
  }

  const handleSearch = () => {
    setIsSearchVisible(true)
  }

  const handleCloseSearch = () => {
    Keyboard.dismiss()
    setIsSearchVisible(false)
    setSearchKeyword('')
  }

  const handleClearSearch = () => {
    setSearchKeyword('')
    loadPosts(buildFilterParams(selectedFilter))
  }

  const handleSearchSubmit = () => {
    if (searchKeyword.trim()) {
      loadPosts({ keyword: searchKeyword.trim() })
    }
  }

  // 接口已经按 mood/keyword 筛选，直接使用返回结果
  const filteredPosts = posts

  const renderPost = ({ item }: { item: CommunityPost }) => (
    <PostItem post={item} />
  )

  const handlePostCreated = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true })
    loadPosts()
  }, [loadPosts])

  return (
    <AppBackground style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>共鸣空间</Text>
          <Text style={styles.headerSubtitle}>在这里，你不是一个人</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        style={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor="#E84C5F"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🌙</Text>
              <Text style={styles.emptyText}>这里还没有帖子</Text>
              <Text style={styles.emptySubtext}>换个心情筛选试试？</Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <>
            {/* Mood Filter Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContainer}
            >
              {moodFilters.map(filter => {
                const isSelected = selectedFilter === filter.key
                return (
                  <TouchableOpacity
                    key={filter.key}
                    style={[
                      styles.filterTab,
                      isSelected && { backgroundColor: filter.activeBg },
                    ]}
                    onPress={() => {
                      setSelectedFilter(filter.key)
                      loadPosts(buildFilterParams(filter.key))
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.filterEmoji}>{filter.emoji}</Text>
                    <Text
                      style={[
                        styles.filterLabel,
                        isSelected && styles.filterLabelSelected,
                        isSelected && { color: filter.activeColor },
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </>
        }
      />

      {/* 悬浮发帖按钮 */}
      <CreatePostInput onPostCreated={handlePostCreated} />

      {/* 搜索弹窗 */}
      <Modal
        visible={isSearchVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseSearch}
      >
        <View style={styles.searchModalOverlay}>
          <View
            style={[
              styles.searchModalContainer,
              { paddingTop: insets.top + 20 },
            ]}
          >
            <View style={styles.searchHeader}>
              <View style={styles.searchInputContainer}>
                <Text style={styles.searchInputIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="搜索帖子内容或昵称..."
                  placeholderTextColor="#999"
                  value={searchKeyword}
                  onChangeText={setSearchKeyword}
                  autoFocus
                  returnKeyType="search"
                  onSubmitEditing={handleSearchSubmit}
                />
                {searchKeyword.length > 0 && (
                  <TouchableOpacity onPress={handleClearSearch}>
                    <Text style={styles.clearIcon}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={handleCloseSearch}>
                <Text style={styles.cancelButton}>取消</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchResultHeader}>
              <Text style={styles.searchResultText}>
                {searchKeyword.trim()
                  ? `找到 ${filteredPosts.length} 条相关帖子`
                  : '输入关键词开始搜索'}
              </Text>
            </View>

            {searchKeyword.trim() && filteredPosts.length > 0 && (
              <FlatList
                data={filteredPosts}
                renderItem={renderPost}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.searchListContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </AppBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E84C5F',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  searchModalContainer: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    // backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInputIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: '#999',
    padding: 4,
  },
  cancelButton: {
    fontSize: 15,
    color: '#666',
    marginLeft: 12,
  },
  searchResultHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchResultText: {
    fontSize: 14,
    color: '#999',
  },
  searchListContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  filterEmoji: {
    fontSize: 13,
    marginRight: 4,
  },
  filterLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterLabelSelected: {
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 100, // 为悬浮按钮留出空间
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    width: '100%',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#bbb',
    marginTop: 6,
  },
})

export default Community
