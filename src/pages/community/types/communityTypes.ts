// Community module types
// "还在吗"应用 - 社区共鸣空间

import { MoodType } from '../../home/types'

export interface ICreatePostParams {
  content: string
  mood?: string
  isFromCheckIn?: boolean
  isAnonymous?: boolean
  images?: string[]
}

export interface IHomeCreatePostParams {
  content: string
  mood?: string
  isFromCheckIn?: boolean
  isAnonymous?: boolean
  images?: string[]
}

export interface IGetPostsParams {
  page?: number
  pageSize?: number
  keyword?: string
  mood?: string
  isFromCheckIn?: boolean
}

export interface IInteractPostParams {
  postId: string
  interactionType: InteractionType
}

export interface IGetUserPostsParams {
  limit?: number
}

export interface CommunityPost {
  id: string
  content: string
  mood?: MoodType // 情绪状态
  createDate: number
  interactions: {
    same: number // 🤝 我也是
    hug: number // 🫂 抱一下
    lieDown: number // 🪦 一起躺
  }
  myInteractions?: {
    same?: boolean
    hug?: boolean
    lieDown?: boolean
  }
  isFromCheckIn: boolean // 是否来自打卡同步
  isAnonymous: boolean
  commentCount?: number
  images?: string[] // 图片URL列表（最多3张）
  userInfo?: {
    id: string
    nickname: string
    avatar?: string
  }
}

export interface CommunityUser {
  id: string
  name: string
  avatar: string
  bio: string
  posts: number
  followers: number
  following: number
}

export interface CommunityComment {
  id: string
  postId: string
  content: string
  createDate: number
  isAnonymous: boolean
  parentId?: string | null
  userInfo?: {
    id: string
    nickname: string
    avatar?: string
  }
  replyToUserInfo?: {
    id: string
    nickname: string
  }
}

export interface ICreateCommentParams {
  content: string
  isAnonymous?: boolean
  parentId?: string | null
  replyToUserId?: string | null
}

export interface IGetCommentsParams {
  page?: number
  pageSize?: number
}

export type InteractionType = 'same' | 'hug' | 'lieDown'

export interface CommunityState {
  posts: CommunityPost[]
  loading: boolean
  error: string | null

  // State setters
  setPosts: (posts: CommunityPost[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addPost: (post: ICreatePostParams) => void
  updatePost: (postId: string, updates: Partial<CommunityPost>) => void
  removePost: (postId: string) => void
}
