import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { CommunityPost } from '../types'
import { MoodType } from '../../home/types'
import InteractionButtons from './interactionButtons'
import type { RootStackParamList } from '@/navigation/appNavigator'

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PostDetail'
>

// 由字符串哈希出 0~359 的色相值，同一帖子永远相同
function hashToHue(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 2147483647
  }
  return Math.abs(hash) % 360
}

// HSL 转 rgb() 字符串
function hslToHex(h: number, s: number, l: number): string {
  const sl = s / 100
  const ll = l / 100
  const c = (1 - Math.abs(2 * ll - 1)) * sl
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ll - c / 2
  let r = 0,
    g = 0,
    b = 0
  if (h < 60) {
    r = c
    g = x
    b = 0
  } else if (h < 120) {
    r = x
    g = c
    b = 0
  } else if (h < 180) {
    r = 0
    g = c
    b = x
  } else if (h < 240) {
    r = 0
    g = x
    b = c
  } else if (h < 300) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }
  return `rgb(${Math.round((r + m) * 255)},${Math.round(
    (g + m) * 255,
  )},${Math.round((b + m) * 255)})`
}

// 从帖子ID派生3个圆形装饰的位置和大小（固定，不随机跳变）
function getDots(id: string) {
  const h = hashToHue(id)
  return [
    { top: -18, left: -18, size: 72, opacity: 0.18, hue: (h + 30) % 360 },
    { top: 20, right: -24, size: 56, opacity: 0.14, hue: (h + 80) % 360 },
    {
      bottom: -10,
      left: '30%' as const,
      size: 44,
      opacity: 0.12,
      hue: (h + 160) % 360,
    },
  ]
}

interface PostItemProps {
  post: CommunityPost
}

// 情绪配置映射
const moodConfig: Record<
  MoodType,
  { emoji: string; text: string; color: string; bgColor: string }
> = {
  fine: { emoji: '🟢', text: '还行', color: '#7DB36C', bgColor: '#E8F4DD' },
  struggling: {
    emoji: '🟡',
    text: '勉强',
    color: '#F4C44C',
    bgColor: '#FDF4D9',
  },
  bad: { emoji: '🔴', text: '不太好', color: '#E84C5F', bgColor: '#FFE5E8' },
}

const PostItem: React.FC<PostItemProps> = ({ post }) => {
  const navigation = useNavigation<NavigationProp>()
  const mood = post.mood as MoodType | undefined
  const config = mood ? moodConfig[mood] : null

  const imageHeight = 120

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
    >
      {/* 图片区域 */}
      <View style={[styles.imageContainer, { height: imageHeight }]}>
        {post.images && post.images.length > 0 ? (
          <Image source={{ uri: post.images[0] }} style={styles.image} />
        ) : post.isFromCheckIn ? (
          <View
            style={[
              styles.placeholderImage,
              { backgroundColor: config?.bgColor ?? '#F0F0F0' },
            ]}
          >
            <Text style={styles.placeholderEmoji}>{config?.emoji ?? '📍'}</Text>
          </View>
        ) : (
          // 手动帖：渐变底色 + 随机圆形装饰
          <View
            style={[
              styles.placeholderImage,
              { backgroundColor: hslToHex(hashToHue(post.id), 60, 92) },
            ]}
          >
            <View
              style={[
                StyleSheet.absoluteFillObject,
                styles.overlayHalf,
                {
                  backgroundColor: hslToHex(
                    (hashToHue(post.id) + 40) % 360,
                    50,
                    88,
                  ),
                },
              ]}
            />
            {getDots(post.id).map((dot, i) => (
              <View
                key={i}
                style={[
                  styles.decorDot,
                  {
                    width: dot.size,
                    height: dot.size,
                    borderRadius: dot.size / 2,
                    backgroundColor: hslToHex(dot.hue, 65, 78),
                    opacity: dot.opacity,
                    top: 'top' in dot ? dot.top : undefined,
                    bottom: 'bottom' in dot ? dot.bottom : undefined,
                    left: 'left' in dot ? dot.left : undefined,
                    right: 'right' in dot ? dot.right : undefined,
                  },
                ]}
              />
            ))}
          </View>
        )}

        {config && (
          <View style={[styles.moodTag, { backgroundColor: config.bgColor }]}>
            <View style={[styles.moodDot, { backgroundColor: config.color }]} />
            <Text style={[styles.moodText, { color: config.color }]}>
              {config.text}
            </Text>
          </View>
        )}
      </View>

      {/* 内容文字 */}
      <Text style={styles.content} numberOfLines={3}>
        {post.content || '分享了一种心情...'}
      </Text>

      {/* 底部固定区域 */}
      <View style={styles.bottom}>
        {/* 互动按钮 */}
        <InteractionButtons
          postId={post.id}
          interactions={post.interactions}
          myInteractions={post.myInteractions}
        />

        {/* 用户头像 + 评论数 */}
        <View style={styles.userInfo}>
          {post.userInfo?.avatar ? (
            <Image
              source={{ uri: post.userInfo.avatar }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarIcon}>👤</Text>
            </View>
          )}
          <Text style={styles.userName} numberOfLines={1}>
            {post.userInfo?.nickname || '匿名用户'}
          </Text>
          <View style={styles.commentBadge}>
            <Text style={styles.commentBadgeText}>
              💬 {post.commentCount ?? 0}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    width: '48%',
    overflow: 'hidden',
    shadowColor: '#E84C5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 48,
  },
  emojiSoft: {
    opacity: 0.7,
  },
  overlayHalf: {
    opacity: 0.5,
  },
  decorDot: {
    position: 'absolute',
  },
  moodTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  moodText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    flex: 1,
  },
  bottom: {},
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  avatarImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  avatarIcon: {
    fontSize: 12,
  },
  userName: {
    fontSize: 11,
    color: '#999',
    flex: 1,
  },
  commentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  commentBadgeText: {
    fontSize: 10,
    color: '#bbb',
  },
})

export default PostItem
