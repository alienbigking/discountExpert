import React from 'react'
import { Text } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Home from '@/pages/home/components/home'
import Community from '@/pages/community/components/community'
import Profile from '@/pages/profile/components/profile'
import Login from '@/pages/login/components/login'
import Register from '@/pages/login/components/register'
import MyPosts from '@/pages/myPosts/components/myPosts'
import Favorites from '@/pages/favorites/components/favorites'
import Settings from '@/pages/settings/components/settings'
import HelpFeedback from '@/pages/helpFeedback/components/helpFeedback'
import PostDetail from '@/pages/community/components/postDetail'
import EditProfile from '@/pages/profile/components/editProfile'
import { useSettingsStore } from '@/pages/settings/stores'
import { useNavigationStore } from '@/navigation/stores'

export type RootStackParamList = {
  Main: undefined
  Login: undefined
  Register: undefined
  MyPosts: undefined
  Favorites: undefined
  Settings: undefined
  HelpFeedback: undefined
  PostDetail: { postId: string }
  EditProfile: { userInfo: import('@/pages/profile/types').UserInfo }
}

export type MainTabParamList = {
  Home: undefined
  Community: undefined
  Profile: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<MainTabParamList>()

// 图标组件
const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ fontSize: size, color }}>🏠</Text>
)

const CommunityIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ fontSize: size, color }}>🌟</Text>
)

const ProfileIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ fontSize: size, color }}>👤</Text>
)

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: '#5B54E4',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: '主页',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="Community"
        component={Community}
        options={{
          tabBarLabel: '社区',
          tabBarIcon: CommunityIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: '我的',
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tab.Navigator>
  )
}

const AppNavigator = () => {
  const { appBackground } = useSettingsStore()
  const { currentRoute } = useNavigationStore()

  const barStyle = React.useMemo(() => {
    const isDark =
      appBackground === '#000' ||
      appBackground === '#121212' ||
      appBackground.startsWith('#1')
    return isDark ? 'light' : 'dark'
    // return isDark ? 'light-content' : 'dark-content'
  }, [appBackground])

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // 状态栏可以由本路由属性控制，也可以交由登录页面去控制状态栏状态

        statusBarStyle: barStyle, // ✅ 控制状态栏文字颜色（暗或亮）
        // statusBarHidden: false, // 隐藏状态栏所有的文字信息
        statusBarTranslucent: true, // Android
        statusBarBackgroundColor:
          currentRoute === 'Login' || currentRoute === 'Register'
            ? 'transparent'
            : appBackground, // Android

        // headerStyle: { backgroundColor: '#f4511e'},
        // contentStyle: { backgroundColor: barStyle },
      }}
      initialRouteName="Main"
    >
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{
          gestureEnabled: false, // 禁用手势返回
        }}
      />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="MyPosts" component={MyPosts} />
      <Stack.Screen name="Favorites" component={Favorites} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="HelpFeedback" component={HelpFeedback} />
      <Stack.Screen name="PostDetail" component={PostDetail} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
    </Stack.Navigator>
  )
}

export default AppNavigator
