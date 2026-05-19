import { env } from '@/config'
import { http } from '@/utils'
import type { IAddFavoriteParams, IGetFavoritesParams } from '../types'

const favoritesService = {
  addFavorite(params: IAddFavoriteParams) {
    return http
      .post(`${env.HOST_API_URL}/api/discountExpert/favorites`, params)
      .then(r => r.data)
  },

  removeFavorite(postId: string) {
    return http
      .delete(`${env.HOST_API_URL}/api/discountExpert/favorites/${postId}`)
      .then(r => r.data)
  },

  getFavorites(params: IGetFavoritesParams = {}) {
    return http
      .get(`${env.HOST_API_URL}/api/discountExpert/favorites`, { params })
      .then(r => r.data)
  },

  checkFavorite(postId: string) {
    return http
      .get(`${env.HOST_API_URL}/api/discountExpert/favorites/check/${postId}`)
      .then(r => r.data)
  },
}

export default favoritesService
