// Profile module store

import { create } from 'zustand'
import type { ProfileState, UserInfo } from '../types'

const profileStore = create<
  ProfileState & {
    userInfo: UserInfo | null
    setUserInfo: (userInfo: UserInfo | null) => void
  }
>(set => ({
  profile: null,
  settings: null,
  stats: null,
  loading: false,
  error: null,
  userInfo: null,

  setLoading: loading => set({ loading }),
  setError: error => set({ error }),
  setProfile: profile => set({ profile }),
  setSettings: settings => set({ settings }),
  setStats: stats => set({ stats }),
  setUserInfo: userInfo => set({ userInfo }),
}))

export default profileStore
