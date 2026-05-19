import { env } from '@/config'
import { http } from '@/utils'
import type {
  ICheckInParams,
  IGetHistoryParams,
  IGetSameMoodCountParams,
} from '../types'

export default {
  // 情绪打卡
  checkIn(params: ICheckInParams) {
    return http
      .post(
        `${env.HOST_API_URL}/api/discountExpert/moodCheckIn/checkIn`,
        params,
      )
      .then(response => response.data)
  },

  // 获取打卡历史
  getHistory(params: IGetHistoryParams = {}) {
    return http
      .get(`${env.HOST_API_URL}/api/discountExpert/moodCheckIn/history`, {
        params,
      })
      .then(response => response.data)
  },

  // 获取连续打卡天数
  getStreak() {
    return http
      .get(`${env.HOST_API_URL}/api/discountExpert/moodCheckIn/streak`)
      .then(response => response.data)
  },

  // 获取情绪统计
  getStats() {
    return http
      .get(`${env.HOST_API_URL}/api/discountExpert/moodCheckIn/stats`)
      .then(response => response.data)
  },

  // 获取今日打卡状态
  getToday() {
    return http
      .get(`${env.HOST_API_URL}/api/discountExpert/moodCheckIn/today`)
      .then(response => response.data)
  },

  // 获取共时性数据
  getSameMoodCount(params: IGetSameMoodCountParams) {
    return http
      .get(`${env.HOST_API_URL}/api/discountExpert/moodCheckIn/sameMoodCount`, {
        params,
      })
      .then(response => response.data)
  },
}
