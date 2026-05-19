import { env } from '@/config'
import { http } from '@/utils'
import type {
  IGetNotesParams,
  ICreateNoteParams,
  IUpdateNoteParams,
} from '../types'

const myNotesService = {
  // 获取笔记列表
  getNotes(params: IGetNotesParams = {}) {
    return http
      .get(`${env.HOST_API_URL}/api/discountExpert/myNotes`, { params })
      .then(response => response.data)
  },

  // 创建笔记
  createNote(params: ICreateNoteParams) {
    return http
      .post(`${env.HOST_API_URL}/api/discountExpert/myNotes`, params)
      .then(response => response.data)
  },

  // 更新笔记
  updateNote(id: string, params: IUpdateNoteParams) {
    return http
      .put(`${env.HOST_API_URL}/api/discountExpert/myNotes/${id}`, params)
      .then(response => response.data)
  },

  // 删除笔记
  deleteNote(id: string) {
    return http
      .delete(`${env.HOST_API_URL}/api/discountExpert/myNotes/${id}`)
      .then(response => response.data)
  },
}

export default myNotesService
