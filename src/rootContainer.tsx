import React, { useState, useCallback, useEffect } from 'react'
import {
  NavigationContainer,
  type NavigationState,
} from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StyleSheet, View, StatusBar, Platform } from 'react-native'
import AppNavigator from '@/navigation/appNavigator'
import { navigationRef } from '@/navigation/navigationService'
import { AuthRoute } from '@/components/authRoute'
import ToastManager from 'toastify-react-native'
import { useSettingsStore } from '@/pages/settings/stores'
import AppStatusBar from '@/components/appStatusBar'
import { useNavigationStore } from '@/navigation/stores'

const RootContainer = () => {
  const [navReady, setNavReady] = useState(false)
  // const [currentRoute, setCurrentRoute] = useState<string | undefined>()
  const { appBackground } = useSettingsStore()
  const { currentRoute, setCurrentRoute } = useNavigationStore()

  // 监听路由变化，获取当前路由名
  const onNavigationStateChange = useCallback(
    (state: NavigationState | undefined) => {
      if (state) {
        const route = state.routes[state.index]
        console.log('当前的路由名', route)
        setCurrentRoute(route.name)
        // setCurrentRoute(route.name)
      }
    },
    [setCurrentRoute],
  )

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => setNavReady(true)}
        onStateChange={onNavigationStateChange}
      >
        <AuthRoute navReady={navReady}>
          <AppNavigator />
        </AuthRoute>
      </NavigationContainer>
      <ToastManager
        style={styles.toastManager}
        width="90%"
        textStyle={styles.toastText}
        theme="light"
        animationStyle="slide"
        position="top"
        duration={2000}
        showCloseIcon={false}
        showProgressBar={true}
        topOffset={50}
        iconSize={24}
        useModal={false}
      />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  toastManager: {
    top: 50,
  },
  toastContainer: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastText: {
    fontSize: 16,
    fontWeight: '600',
  },
})

export default RootContainer
