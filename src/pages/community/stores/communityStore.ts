// Community module store
// "还在吗"应用 - 社区共鸣空间状态管理

import { create } from 'zustand'
import type { CommunityState, CommunityPost } from '../types'

const communityStore = create<CommunityState>(set => ({
  posts: [],
  loading: false,
  error: null,

  setPosts: (posts: CommunityPost[]) => set({ posts }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  addPost: (post: CommunityPost) =>
    set(state => ({ posts: [post, ...state.posts] })),
  updatePost: (postId: string, updates: Partial<CommunityPost>) =>
    set(state => ({
      posts: state.posts.map(post =>
        post.id === postId ? { ...post, ...updates } : post,
      ),
    })),
  removePost: (postId: string) =>
    set(state => ({
      posts: state.posts.filter(post => post.id !== postId),
    })),
}))

export default communityStore
