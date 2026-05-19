// Home module types
// "还在吗"应用 - 情绪打卡功能

export type HomeDemoType = {
  id: string
}

export type HomeFeedQueryType = {
  page?: number
  pageSize?: number
}

export interface ICheckInParams {
  mood: MoodType
  syncToCommunity: boolean
}

export interface IGetHistoryParams {
  limit?: number
}

export interface IGetSameMoodCountParams {
  mood: MoodType
}

// 情绪类型定义
export type MoodType = 'fine' | 'struggling' | 'bad'

export interface MoodHistoryItem {
  mood: MoodType
  timestamp: number
  checkInDate: string // YYYY-MM-DD
}

// 单个情绪配置
export interface MoodConfigItem {
  emoji: string
  text: string
  description: string
  color: string
  lightBg: string
}

// 主页Store状态
export interface HomeStoreState {
  todayCheckedIn: boolean
  currentMood: MoodType | null
  checkInStreak: number
  totalCheckIn: number
  sameMoodCount: number
  moodHistory: MoodHistoryItem[]
  moodConfig: Record<MoodType, MoodConfigItem>

  // State setters
  setTodayCheckedIn: (todayCheckedIn: boolean) => void
  setCurrentMood: (currentMood: MoodType | null) => void
  setCheckInStreak: (checkInStreak: number) => void
  setTotalCheckIn: (totalCheckIn: number) => void
  setSameMoodCount: (sameMoodCount: number) => void
  setMoodHistory: (moodHistory: MoodHistoryItem[]) => void
  addMoodHistory: (item: MoodHistoryItem) => void
  resetDaily: () => void
}
