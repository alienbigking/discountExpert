export interface HelpFeedbackState {
  loading: boolean
  setLoading: (loading: boolean) => void
}

export interface FeedbackItem {
  id: string
  content: string
  contact?: string
  createdAt: number
}

export interface SubmitFeedbackPayload {
  content: string
  contact?: string
}

export interface ISubmitFeedbackParams {
  content: string
  contact?: string
}
