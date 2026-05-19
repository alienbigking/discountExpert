// Profile module types

export interface UserInfo {
  id: string
  nickname: string
  avatar?: string
}

export interface IUpdateProfileParams {
  nickname?: string
  avatar?: string
}

export interface IUpdatePrivacyParams {
  privacySettings: any
}

export interface IUpdateStreakParams {
  currentStreak: number
  longestStreak: number
}

export interface UserProfile {
  id: string
  username: string
  email: string
  avatar: string
  bio: string
  createdAt: string
  updatedAt: string
}

export interface UserSettings {
  notifications: boolean
  darkMode: boolean
  language: string
  privacy: {
    profileVisible: boolean
    showEmail: boolean
  }
}

export interface UserStats {
  notesCount: number
  favoritesCount: number
  communityPosts: number
  followers: number
  following: number
}

export interface ProfileState {
  profile: UserProfile | null
  settings: UserSettings | null
  stats: UserStats | null
  loading: boolean
  error: string | null

  // State setters
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setProfile: (profile: UserProfile | null) => void
  setSettings: (settings: UserSettings | null) => void
  setStats: (stats: UserStats | null) => void
}
