import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Toast } from 'toastify-react-native'
import { communityService } from '../services'
import { CommunityPost, CommunityComment, InteractionType } from '../types'
import { MoodType } from '../../home/types'
import InteractionButtons from './interactionButtons'
import type { RootStackParamList } from '@/navigation/appNavigator'
import { favoritesService } from '@/pages/favorites/services'
import { useFavoritesStore } from '@/pages/favorites/stores'
import { useSettingsStore } from '@/pages/settings/stores'
import { ImageLightbox } from '@/components/imageLightbox'

type PostDetailRouteProp = RouteProp<RootStackParamList, 'PostDetail'>

const { width: SCREEN_WIDTH } = Dimensions.get('window')

function hashToHue(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 2147483647
  }
  return Math.abs(hash) % 360
}

function hslToRgb(h: number, s: number, l: number): string {
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
  } else if (h < 120) {
    r = x
    g = c
  } else if (h < 180) {
    g = c
    b = x
  } else if (h < 240) {
    g = x
    b = c
  } else if (h < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }
  return `rgb(${Math.round((r + m) * 255)},${Math.round(
    (g + m) * 255,
  )},${Math.round((b + m) * 255)})`
}

const moodConfig: Partial<
  Record<
    MoodType,
    { emoji: string; text: string; color: string; bgColor: string }
  >
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

const PostDetail: React.FC = () => {
  const navigation = useNavigation()
  const route = useRoute<PostDetailRouteProp>()
  const { postId } = route.params
  const insets = useSafeAreaInsets()

  const appBackground = useSettingsStore(s => s.appBackground)

  const [lightboxVisible, setLightboxVisible] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxVisible(true)
  }

  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriting, setFavoriting] = useState(false)
  const { addItem, removeItem } = useFavoritesStore()

  const [post, setPost] = useState<CommunityPost | null>(null)
  const [interactions, setInteractions] = useState<
    CommunityPost['interactions'] | null
  >(null)
  const [comments, setComments] = useState<CommunityComment[]>([])
  const [postLoading, setPostLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyTo, setReplyTo] = useState<{
    commentId: string
    userId: string
    nickname: string
  } | null>(null)
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    favoritesService.checkFavorite(postId).then(res => {
      if (res.status === 0) setIsFavorited(res.data?.isFavorited ?? false)
    })
  }, [postId])

  const handleToggleFavorite = async () => {
    if (favoriting) return
    setFavoriting(true)
    if (isFavorited) {
      const { status, message } = await favoritesService.removeFavorite(postId)
      if (status === 0) {
        setIsFavorited(false)
        removeItem(postId)
        Toast.success('已取消收藏')
      } else {
        Toast.error(message)
      }
    } else {
      const { status, data, message } = await favoritesService.addFavorite({
        postId,
      })
      if (status === 0) {
        setIsFavorited(true)
        if (data) addItem(data)
        Toast.success('收藏成功')
      } else {
        Toast.error(message)
      }
    }
    setFavoriting(false)
  }

  const loadPost = useCallback(async () => {
    setPostLoading(true)
    const { status, data, message } = await communityService.getPostById(postId)
    console.log('PostDetail raw data:', JSON.stringify(data, null, 2))
    if (status === 0) {
      setPost(data)
      setInteractions(data?.interactions || null)
    } else {
      Toast.error(message)
    }
    setPostLoading(false)
  }, [postId])

  const loadComments = useCallback(async () => {
    setCommentsLoading(true)
    const { status, data, message } = await communityService.getComments(postId)
    if (status === 0) {
      setComments(data?.list || [])
    } else {
      Toast.error(message)
    }
    setCommentsLoading(false)
  }, [postId])

  useEffect(() => {
    loadPost()
    loadComments()
  }, [loadPost, loadComments])

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return
    setSubmitting(true)
    const { status, message } = await communityService.createComment(postId, {
      content: commentText.trim(),
      parentId: replyTo?.commentId || null,
      replyToUserId: replyTo?.userId || null,
    })
    if (status === 0) {
      setCommentText('')
      setReplyTo(null)
      loadComments()
    } else {
      Toast.error(message)
    }
    setSubmitting(false)
  }

  const handleReply = (comment: CommunityComment) => {
    const nickname = comment.isAnonymous
      ? '匿名用户'
      : comment.userInfo?.nickname || '匿名用户'
    const userId = comment.userInfo?.id || ''
    setReplyTo({ commentId: comment.id, userId, nickname })
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const [imgIndex, setImgIndex] = useState(0)

  const mood = post?.mood as MoodType | undefined
  const config = mood ? moodConfig[mood] : null

  const renderComment = ({ item }: { item: CommunityComment }) => {
    const isReply = !!item.parentId
    const nickname = item.isAnonymous
      ? '匿名用户'
      : item.userInfo?.nickname || '匿名用户'
    const replyToNickname = item.replyToUserInfo?.nickname
    const timeStr = new Date(item.createDate).toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    return (
      <View style={[styles.commentItem, isReply && styles.commentItemReply]}>
        <View
          style={isReply ? styles.commentAvatarSmall : styles.commentAvatar}
        >
          {item.userInfo?.avatar ? (
            <Image
              source={{ uri: item.userInfo.avatar }}
              style={
                isReply
                  ? styles.commentAvatarImageSmall
                  : styles.commentAvatarImage
              }
            />
          ) : (
            <Text
              style={
                isReply
                  ? styles.commentAvatarIconSmall
                  : styles.commentAvatarIcon
              }
            >
              👤
            </Text>
          )}
        </View>
        <View style={styles.commentBody}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentNickname}>{nickname}</Text>
            {replyToNickname ? (
              <Text style={styles.replyToText}>
                {' '}
                回复 <Text style={styles.replyToName}>{replyToNickname}</Text>
              </Text>
            ) : null}
          </View>
          <Text style={styles.commentContent}>{item.content}</Text>
          <View style={styles.commentFooter}>
            <Text style={styles.commentTime}>{timeStr}</Text>
            <TouchableOpacity
              onPress={() => handleReply(item)}
              style={styles.replyBtn}
            >
              <Text style={styles.replyBtnText}>回复</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.bottom}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: appBackground }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>帖子详情</Text>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={styles.favoriteBtn}
            disabled={favoriting}
          >
            <Text style={styles.favoriteBtnIcon}>
              {isFavorited ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>

        {postLoading ? (
          <ActivityIndicator color="#E84C5F" style={styles.loader} />
        ) : post ? (
          <FlatList
            data={comments}
            keyExtractor={item => item.id}
            renderItem={renderComment}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View>
                {/* 帖子主体 */}
                <View style={styles.postCard}>
                  {/* 图片区域 */}
                  {post.images && post.images.length > 0 ? (
                    <View style={styles.imageArea}>
                      <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={e => {
                          const idx = Math.round(
                            e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
                          )
                          setImgIndex(idx)
                        }}
                      >
                        {post.images.map((uri, i) => (
                          <TouchableOpacity
                            key={i}
                            activeOpacity={0.95}
                            onPress={() => openLightbox(i)}
                          >
                            <Image source={{ uri }} style={styles.postImage} />
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                      {post.images.length > 1 && (
                        <View style={styles.imgDots}>
                          {post.images.map((_, i) => (
                            <View
                              key={i}
                              style={[
                                styles.imgDot,
                                i === imgIndex && styles.imgDotActive,
                              ]}
                            />
                          ))}
                        </View>
                      )}
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.imageArea,
                        styles.imagePlaceholder,
                        {
                          backgroundColor: hslToRgb(hashToHue(post.id), 55, 90),
                        },
                      ]}
                    >
                      <View
                        style={[
                          StyleSheet.absoluteFillObject,
                          styles.placeholderOverlay,
                          {
                            backgroundColor: hslToRgb(
                              (hashToHue(post.id) + 40) % 360,
                              45,
                              86,
                            ),
                          },
                        ]}
                      />
                      {[
                        {
                          top: -24,
                          left: -24,
                          size: 120,
                          hue: (hashToHue(post.id) + 30) % 360,
                          op: 0.2,
                        },
                        {
                          top: 20,
                          right: -30,
                          size: 90,
                          hue: (hashToHue(post.id) + 80) % 360,
                          op: 0.15,
                        },
                        {
                          bottom: -16,
                          left: '30%' as const,
                          size: 70,
                          hue: (hashToHue(post.id) + 160) % 360,
                          op: 0.13,
                        },
                      ].map((dot, i) => (
                        <View
                          key={i}
                          style={[
                            styles.decorDot,
                            {
                              width: dot.size,
                              height: dot.size,
                              borderRadius: dot.size / 2,
                              backgroundColor: hslToRgb(dot.hue, 60, 78),
                              opacity: dot.op,
                              top: 'top' in dot ? dot.top : undefined,
                              bottom: 'bottom' in dot ? dot.bottom : undefined,
                              left:
                                'left' in dot ? (dot.left as any) : undefined,
                              right: 'right' in dot ? dot.right : undefined,
                            },
                          ]}
                        />
                      ))}
                      {config && (
                        <View
                          style={[
                            styles.moodTagFloat,
                            { backgroundColor: config.bgColor },
                          ]}
                        >
                          <Text
                            style={[styles.moodText, { color: config.color }]}
                          >
                            {config.emoji} {config.text}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* 用户信息 */}
                  <View style={styles.postUserRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarIcon}>👤</Text>
                    </View>
                    <View style={styles.postUserInfo}>
                      <Text style={styles.postNickname}>
                        {post.isAnonymous
                          ? '匿名用户'
                          : post.userInfo?.nickname || '匿名用户'}
                      </Text>
                      <Text style={styles.postTime}>
                        {new Date(post.createDate).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                    {config && (
                      <View
                        style={[
                          styles.moodTag,
                          { backgroundColor: config.bgColor },
                        ]}
                      >
                        <Text
                          style={[styles.moodText, { color: config.color }]}
                        >
                          {config.emoji} {config.text}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* 帖子内容 */}
                  <Text style={styles.postContent}>{post.content}</Text>

                  {/* 互动按钮 */}
                  <View style={styles.postInteractionWrap}>
                    <InteractionButtons
                      postId={post.id}
                      interactions={interactions || post.interactions}
                      myInteractions={post.myInteractions}
                      onInteracted={(type: InteractionType) => {
                        setInteractions(prev =>
                          prev
                            ? { ...prev, [type]: (prev[type] || 0) + 1 }
                            : prev,
                        )
                      }}
                    />
                  </View>
                </View>

                {/* 评论区标题 */}
                <View style={styles.commentSection}>
                  <Text style={styles.commentSectionTitle}>
                    评论 {commentsLoading ? '' : `(${comments.length})`}
                  </Text>
                </View>

                {commentsLoading && (
                  <ActivityIndicator
                    color="#E84C5F"
                    style={styles.commentsLoader}
                  />
                )}

                {!commentsLoading && comments.length === 0 && (
                  <View style={styles.emptyComments}>
                    <Text style={styles.emptyCommentsIcon}>💬</Text>
                    <Text style={styles.emptyCommentsText}>
                      还没有评论，来说点什么吧
                    </Text>
                  </View>
                )}
              </View>
            }
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: 80 + insets.bottom },
            ]}
          />
        ) : null}

        {/* 评论输入框 */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={
              replyTo ? `回复 ${replyTo.nickname}...` : '说点什么...'
            }
            placeholderTextColor="#bbb"
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={200}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!commentText.trim() || submitting) && styles.sendBtnDisabled,
            ]}
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.sendBtnText}>发送</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 全屏图片查看 */}
      <ImageLightbox
        images={post?.images ?? []}
        initialIndex={lightboxIndex}
        visible={lightboxVisible}
        onClose={() => setLightboxVisible(false)}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    width: 36,
    alignItems: 'center',
  },
  favoriteBtn: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteBtnIcon: {
    fontSize: 22,
  },
  backIcon: {
    fontSize: 28,
    color: '#333',
    lineHeight: 32,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  loader: {
    marginTop: 60,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#E84C5F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageArea: {
    width: '100%',
    height: SCREEN_WIDTH * 0.75,
    position: 'relative',
    overflow: 'hidden',
  },
  postImage: {
    width: SCREEN_WIDTH - 32,
    height: SCREEN_WIDTH * 0.75,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorDot: {
    position: 'absolute',
  },
  moodTagFloat: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  imgDots: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  imgDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  imgDotActive: {
    backgroundColor: '#fff',
    width: 16,
  },
  postUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarIcon: {
    fontSize: 18,
  },
  postUserInfo: {
    flex: 1,
  },
  postNickname: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  postTime: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2,
  },
  moodTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moodText: {
    fontSize: 12,
    fontWeight: '600',
  },
  postContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  postInteractionWrap: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  placeholderOverlay: {
    opacity: 0.5,
  },
  commentSection: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 8,
  },
  commentSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  commentsLoader: {
    marginTop: 20,
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCommentsIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  emptyCommentsText: {
    fontSize: 14,
    color: '#bbb',
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EFEFEF',
  },
  commentItemReply: {
    marginLeft: 46,
    borderBottomWidth: 0,
    paddingVertical: 10,
  },
  commentAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  commentAvatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  commentAvatarIcon: {
    fontSize: 18,
  },
  commentAvatarSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    flexShrink: 0,
  },
  commentAvatarImageSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  commentAvatarIconSmall: {
    fontSize: 13,
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 3,
  },
  commentNickname: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  commentContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  commentTime: {
    fontSize: 12,
    color: '#bbb',
  },
  replyBtn: {
    paddingLeft: 12,
    paddingVertical: 2,
  },
  replyBtnText: {
    fontSize: 12,
    color: '#999',
  },
  replyToText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '400',
  },
  replyToName: {
    color: '#E84C5F',
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    maxHeight: 100,
    marginRight: 10,
  },
  sendBtn: {
    backgroundColor: '#E84C5F',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  sendBtnDisabled: {
    backgroundColor: '#F0A0A8',
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
})

export default PostDetail
