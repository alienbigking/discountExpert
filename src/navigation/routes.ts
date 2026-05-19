export type { RouteConfig, RouteName } from './types'

import { homeRoutes } from '@/pages/home/routes'
import { communityRoutes } from '@/pages/community/routes'
import { profileRoutes } from '@/pages/profile/routes'
import { myPostsRoutes } from '@/pages/myPosts/routes'
import { favoritesRoutes } from '@/pages/favorites/routes'
import { settingsRoutes } from '@/pages/settings/routes'
import { helpFeedbackRoutes } from '@/pages/helpFeedback/routes'
import { loginRoutes } from '@/pages/login/routes'

export const routes = [
  ...homeRoutes,
  ...communityRoutes,
  ...profileRoutes,
  ...myPostsRoutes,
  ...favoritesRoutes,
  ...settingsRoutes,
  ...helpFeedbackRoutes,
  ...loginRoutes,
]
