import React, { useCallback, useEffect } from 'react'
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Toast } from 'toastify-react-native'
import { useFavoritesStore } from '../stores'
import { favoritesService } from '../services'
import type { RootStackParamList } from '@/navigation/appNavigator'
import PostItem from '@/pages/community/components/postItem'
import AppBackground from '@/components/appBackground'
import { useSettingsStore } from '@/pages/settings/stores'

type NavProp = NativeStackNavigationProp<RootStackParamList>

const Favorites: React.FC = () => {
  const navigation = useNavigation<NavProp>()
  const insets = useSafeAreaInsets()
  // navigation 仅用于 goBack

  const { items, setItems, setLoading, setError } = useFavoritesStore()
  const appBackground = useSettingsStore(s => s.appBackground)

  const loadFavorites = useCallback(async () => {
    setLoading(true)
    const { status, data, message } = await favoritesService.getFavorites()
    if (status === 0) {
      setItems(data?.list ?? [])
    } else {
      setError(message)
      Toast.error(message)
    }
    setLoading(false)
  }, [setLoading, setItems, setError])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <View style={[styles.header, { backgroundColor: appBackground }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>⭐ 收藏夹</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <FlatList
          data={items}
          keyExtractor={item => item.id ?? item.postId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>暂无收藏</Text>
              <Text style={styles.emptySubText}>
                在帖子详情页点击 ☆ 即可收藏
              </Text>
            </View>
          }
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) =>
            item.post ? (
              <PostItem post={item.post} />
            ) : (
              <View style={{ width: '48%' }} />
            )
          }
        />
      </View>
    </AppBackground>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  headerRight: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  emptyWrap: {
    paddingTop: 120,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 13,
    color: '#aaa',
  },
})

export default Favorites
