import type React from 'react'

export type RouteName =
  | 'Home'
  | 'Community'
  | 'Profile'
  | 'Login'
  | 'MyPosts'
  | 'Favorites'
  | 'Settings'
  | 'HelpFeedback'
  | 'PostDetail'

export type RouteConfig = {
  name: RouteName
  component: React.ComponentType<any>
  options?: any
}
