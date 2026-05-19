import React from 'react'
import RootContainer from '@/rootContainer'
import AppStatusBar from '@/components/appStatusBar'
import { useSettingsStore } from '@/pages/settings/stores'
import { StatusBar, Platform, View } from 'react-native'

const App = () => {
  const { appBackground } = useSettingsStore()

  const barStyle = React.useMemo(() => {
    const isDark =
      appBackground === '#000' ||
      appBackground === '#121212' ||
      appBackground.startsWith('#1')
    console.log('状态值发生变化了', appBackground)
    // return isDark ? 'light' : 'dark'
    return isDark ? 'light-content' : 'dark-content'
  }, [appBackground])

  return (
    <React.Fragment>
      {/* 改为由路由或登录页中的状态栏控制逻辑统一控制状态 */}
      {/* {Platform.OS === 'android' && (
        <AppStatusBar
          translucent={true}
          backgroundColor={'transparent'} // transparent
          barStyle={barStyle}
        />
      )} */}
      <RootContainer />
    </React.Fragment>
  )
}

export default App
