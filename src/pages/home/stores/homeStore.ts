// Home module store
// "还在吗"应用 - 情绪打卡状态管理

import { create } from 'zustand'
import type { HomeStoreState, MoodType, MoodHistoryItem } from '../types'

const homeStore = create<HomeStoreState>(set => ({
  todayCheckedIn: false,
  currentMood: null,
  checkInStreak: 0,
  totalCheckIn: 0,
  sameMoodCount: 0,
  moodHistory: [],
  moodConfig: {
    fine: {
      emoji: '🟢',
      text: '还行',
      description: '平静的一天',
      color: '#7DB36C',
      lightBg: '#E8F4DD',
    },
    struggling: {
      emoji: '🟡',
      text: '勉强',
      description: '有点撑不住',
      color: '#F4C44C',
      lightBg: '#FDF4D9',
    },
    bad: {
      emoji: '🔴',
      text: '不太好',
      description: '需要被看见',
      color: '#E84C5F',
      lightBg: '#FFE5E8',
    },
  },

  setTodayCheckedIn: (todayCheckedIn: boolean) => set({ todayCheckedIn }),
  setCurrentMood: (currentMood: MoodType | null) => set({ currentMood }),
  setCheckInStreak: (checkInStreak: number) => set({ checkInStreak }),
  setTotalCheckIn: (totalCheckIn: number) => set({ totalCheckIn }),
  setSameMoodCount: (sameMoodCount: number) => set({ sameMoodCount }),
  setMoodHistory: (moodHistory: MoodHistoryItem[]) => set({ moodHistory }),
  addMoodHistory: (item: MoodHistoryItem) =>
    set((state: HomeStoreState) => ({
      moodHistory: [item, ...state.moodHistory].slice(0, 30),
    })),
  resetDaily: () => {
    set({
      todayCheckedIn: false,
      currentMood: null,
      sameMoodCount: 0,
    })
  },
}))

export default homeStore
