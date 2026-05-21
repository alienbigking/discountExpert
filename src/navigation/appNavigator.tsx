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
import AboutApp from '@/pages/aboutApp'
import FollowAccount from '@/pages/followAccount'
import PrivacyPolicy from '@/pages/privacyPolicy'
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
  AboutApp: undefined
  FollowAccount: undefined
  PrivacyPolicy: undefined
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
        backgroundColor: 'rgba(255,255,255,0.75)',
        borderTopWidth: 0,
        elevation: 0,
        paddingBottom: 4,
        paddingTop: 4,
        height: 64,
        position: 'absolute',
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
      <Stack.Screen name="AboutApp" component={AboutApp} />
      <Stack.Screen name="FollowAccount" component={FollowAccount} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
    </Stack.Navigator>
  )
}

export default AppNavigator
