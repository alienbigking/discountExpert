// Community module service
// "还在吗"应用 - 社区共鸣空间

import { env } from '@/config'
import { http } from '@/utils'
import type {
  InteractionType,
  ICreatePostParams,
  IGetPostsParams,
  ICreateCommentParams,
  IGetCommentsParams,
} from '../types'

const communityService = {
  // 获取帖子列表
  getPosts(params: IGetPostsParams = {}) {
    return http
      .get(`${env.HOST_API_URL}/api/discountExpert/community/posts`, {
        params,
      })
      .then(response => response.data)
  },

  // 创建帖子
  createPost(params: ICreatePostParams) {
    return http
      .post(`${env.HOST_API_URL}/api/discountExpert/community/posts`, params)
      .then(response => response.data)
  },

  // 上传帖子图片
  uploadImage(formData: FormData) {
    return http
      .post(`${env.HOST_API_URL}/file`, formData)
      .then(response => response.data)
  },

  // 互动帖子
  interactPost(postId: string, interactionType: InteractionType) {
    return http.post(
      `${env.HOST_API_URL}/api/discountExpert/community/posts/${postId}/interact`,
      { interactionType },
    )
  },

  // 删除帖子
  deletePost(postId: string) {
    return http.delete(
      `${env.HOST_API_URL}/api/discountExpert/community/posts/${postId}`,
    )
  },

  // 获取我的帖子
  getMyPosts(params: { page?: number; pageSize?: number } = {}) {
    return http
      .get(`${env.HOST_API_URL}/api/discountExpert/community/posts/mine`, {
        params,
      })
      .then(response => response.data)
  },

  // 获取帖子详情
  getPostById(postId: string) {
    return http
      .get(`${env.HOST_API_URL}/api/discountExpert/community/posts/${postId}`)
      .then(response => response.data)
  },

  // 获取评论列表
  getComments(postId: string, params: IGetCommentsParams = {}) {
    return http
      .get(
        `${env.HOST_API_URL}/api/discountExpert/community/posts/${postId}/comments`,
        { params },
      )
      .then(response => response.data)
  },

  // 发布评论
  createComment(postId: string, params: ICreateCommentParams) {
    return http
      .post(
        `${env.HOST_API_URL}/api/discountExpert/community/posts/${postId}/comments`,
        params,
      )
      .then(response => response.data)
  },

  // 删除评论
  deleteComment(commentId: string) {
    return http
      .delete(
        `${env.HOST_API_URL}/api/discountExpert/community/comments/${commentId}`,
      )
      .then(response => response.data)
  },
}

export default communityService
