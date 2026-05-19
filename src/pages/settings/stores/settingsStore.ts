import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { StatusBar, Platform } from 'react-native'
import type { SettingsState } from '../types'

const settingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      syncToCommunity: true,
      allowInteraction: true,
      appBackground: '#FFF5F6',

      toggleSyncToCommunity: () => {
        set({ syncToCommunity: !get().syncToCommunity })
      },

      toggleAllowInteraction: () => {
        set({ allowInteraction: !get().allowInteraction })
      },

      setAppBackground: (color: string) => {
        set({ appBackground: color })
      },
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => state => {
        // if (state && Platform.OS === 'android') {
        //   StatusBar.setBackgroundColor(state.appBackground, true)
        //   StatusBar.setBarStyle('dark-content', true)
        // }
      },
    },
  ),
)

export default settingsStore
