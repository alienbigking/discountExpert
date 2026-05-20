import { Linking } from 'react-native'
import { Toast } from 'toastify-react-native'
import type { IOpenEntryParams } from '../types'

const homeService = {
  async openEntry(params: IOpenEntryParams) {
    const { deeplink, webFallback } = params
    try {
      await Linking.openURL(deeplink)
    } catch {
      if (webFallback) {
        try {
          await Linking.openURL(webFallback)
        } catch {
          Toast.error('无法打开，请检查网络')
        }
      } else {
        Toast.info('请先安装对应 App 再使用此入口')
      }
    }
  },
}

export default homeService
