// Profile module service

import { env } from '@/config'
import { http, uploadFile } from '@/utils'
import type {
  IUpdatePrivacyParams,
  IUpdateStreakParams,
  IUpdateProfileParams,
} from '../types'

const profileService = {
  // 获取当前用户信息
  getMe() {
    return http.get(`${env.HOST_API_URL}/me`).then(response => response.data)
  },

  // 更新当前用户信息（昵称/头像）
  updateMe(params: IUpdateProfileParams) {
    return http
      .put(`${env.HOST_API_URL}/me`, params)
      .then(response => response.data)
  },

  // 上传头像图片
  uploadAvatar(fileUri: string, fileName: string, fileType: string) {
    return uploadFile(`${env.HOST_API_URL}/file`, {
      uri: fileUri,
      name: fileName,
      type: fileType,
    })
  },

  // 获取用户档案
  getProfile() {
    return http
      .get(`${env.HOST_API_URL}/api/discountExpert/profile`)
      .then(response => response.data)
  },

  // 更新隐私设置
  updatePrivacy(params: IUpdatePrivacyParams) {
    return http
      .put(`${env.HOST_API_URL}/api/discountExpert/profile/privacy`, params)
      .then(response => response.data)
  },

  // 分析人格类型
  analyzePersonality() {
    return http
      .post(`${env.HOST_API_URL}/api/discountExpert/profile/analyzePersonality`)
      .then(response => response.data)
  },

  // 更新打卡统计
  updateStreak(params: IUpdateStreakParams) {
    return http
      .put(`${env.HOST_API_URL}/api/discountExpert/profile/streak`, params)
      .then(response => response.data)
  },
}

export default profileService
