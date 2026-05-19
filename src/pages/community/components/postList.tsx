import React, { useEffect, useCallback } from 'react'
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { useCommunityStore } from '../stores'
import { CommunityPost } from '../types'
import PostItem from './postItem'
import { communityService } from '../services'

const PostList: React.FC = () => {
  const { posts, loading, setPosts, setLoading, setError } = useCommunityStore()

  const loadPosts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await communityService.getPosts()
      setPosts(data)
    } catch {
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setPosts, setError])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  const handleRefresh = () => {
    loadPosts()
  }

  const renderPost = ({ item }: { item: CommunityPost }) => (
    <PostItem post={item} />
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        style={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor="#5B54E4"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 50, // 为悬浮按钮留出空间
  },
})

export default PostList
