import type { RouteConfig } from '@/navigation/types'
import MyPosts from './components/myPosts'

export const myPostsRoutes: RouteConfig[] = [
  {
    name: 'MyPosts',
    component: MyPosts,
  },
]
