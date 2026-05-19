export interface IAddFavoriteParams {
  postId: string
}

export interface IGetFavoritesParams {
  limit?: number
}

export interface FavoriteItem {
  _id: string
  id: string
  postId: string
  createDate: number
  post?: any
}

export interface FavoritesState {
  items: FavoriteItem[]
  loading: boolean
  error: string | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setItems: (items: FavoriteItem[]) => void
  addItem: (item: FavoriteItem) => void
  removeItem: (postId: string) => void
  hasPostFavorite: (postId: string) => boolean
}
