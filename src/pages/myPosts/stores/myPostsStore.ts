import { create } from 'zustand'
import type { MyPostsState, Note } from '../types'

const myPostsStore = create<MyPostsState>(set => ({
  notes: [],
  loading: false,
  error: null,

  setNotes: (notes: Note[]) => set({ notes }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  addNote: (note: Note) => set(state => ({ notes: [note, ...state.notes] })),
  updateNote: (id: string, updates: Partial<Note>) =>
    set(state => ({
      notes: state.notes.map(note =>
        note.id === id ? { ...note, ...updates } : note,
      ),
    })),
  deleteNote: (id: string) =>
    set(state => ({
      notes: state.notes.filter(n => n.id !== id),
    })),
}))

export default myPostsStore
