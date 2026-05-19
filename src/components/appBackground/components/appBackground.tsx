import React, { useEffect, useCallback } from 'react'
import { StyleSheet, View, StatusBar, Platform } from 'react-native'
import { useSettingsStore } from '@/pages/settings/stores'
import { useFocusEffect } from '@react-navigation/native'

interface AppBackgroundProps {
  children: React.ReactNode
  style?: object
}

const AppBackground: React.FC<AppBackgroundProps> = ({ children, style }) => {
  const appBackground = useSettingsStore(s => s.appBackground)

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(appBackground, true)
      StatusBar.setBarStyle('dark-content', true)
    }
  }, [appBackground])

  return (
    <View style={[styles.container, { backgroundColor: appBackground }, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default AppBackground
