import { create } from 'zustand'
import type { FavoriteItem, FavoritesState } from '../types'

const favoritesStore = create<FavoritesState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  setItems: (items: FavoriteItem[]) => set({ items }),
  addItem: (item: FavoriteItem) =>
    set(state => ({ items: [item, ...state.items] })),
  removeItem: (postId: string) =>
    set(state => ({
      items: state.items.filter((i: FavoriteItem) => i.postId !== postId),
    })),
  hasPostFavorite: (postId: string): boolean => {
    return Boolean(get().items.find((i: FavoriteItem) => i.postId === postId))
  },
}))

export default favoritesStore
