export interface SettingsState {
  syncToCommunity: boolean
  allowInteraction: boolean
  appBackground: string

  toggleSyncToCommunity: () => void
  toggleAllowInteraction: () => void
  setAppBackground: (color: string) => void
}
