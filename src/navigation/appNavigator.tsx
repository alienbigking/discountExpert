import React from 'react'
import { Text } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Home from '@/pages/home/components/home'
import Login from '@/pages/login/components/login'
import Register from '@/pages/login/components/register'
import Profile from '@/pages/profile/components/profile'
import EditProfile from '@/pages/profile/components/editProfile'
import Settings from '@/pages/settings/components/settings'
import HelpFeedback from '@/pages/helpFeedback/components/helpFeedback'
import WebViewScreen from '@/pages/webView/components/webView'
import { useNavigationStore } from '@/navigation/stores'
import type { UserInfo } from '@/pages/profile/types'

export type RootStackParamList = {
  Main: undefined
  Login: undefined
  Register: undefined
  Settings: undefined
  HelpFeedback: undefined
  EditProfile: { userInfo: UserInfo }
  WebViewScreen: { url: string; title: string; deeplink?: string }
}

export type MainTabParamList = {
  Home: undefined
  Profile: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<MainTabParamList>()

const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ fontSize: size, color }}>🏷️</Text>
)

const ProfileIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ fontSize: size, color }}>👤</Text>
)

const MainTabNavigator = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={{
      tabBarActiveTintColor: '#E54444',
      tabBarInactiveTintColor: '#999',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingBottom: 8,
        paddingTop: 8,
        height: 80,
      },
      tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
      headerShown: false,
    }}
  >
    <Tab.Screen
      name="Home"
      component={Home}
      options={{ tabBarLabel: '优惠入口', tabBarIcon: HomeIcon }}
    />
    <Tab.Screen
      name="Profile"
      component={Profile}
      options={{ tabBarLabel: '我的', tabBarIcon: ProfileIcon }}
    />
  </Tab.Navigator>
)

const AppNavigator = () => {
  const { currentRoute } = useNavigationStore()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        statusBarStyle: 'dark',
        statusBarTranslucent: true,
        statusBarBackgroundColor:
          currentRoute === 'Login' || currentRoute === 'Register'
            ? 'transparent'
            : '#FAFAF7',
        contentStyle: { backgroundColor: '#FAFAF7' },
      }}
      initialRouteName="Main"
    >
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="HelpFeedback" component={HelpFeedback} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
    </Stack.Navigator>
  )
}

export default AppNavigator
