export interface Note {
  id: string
  title: string
  content: string
  createdAt: number
}

export interface IGetNotesParams {
  limit?: number
}

export interface ICreateNoteParams {
  title?: string
  content: string
}

export interface IUpdateNoteParams {
  title?: string
  content?: string
}

export interface MyPostsState {
  notes: Note[]
  loading: boolean
  error: string | null

  // State setters
  setNotes: (notes: Note[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  addNote: (note: Note) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
}
