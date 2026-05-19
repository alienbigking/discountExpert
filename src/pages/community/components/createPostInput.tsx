import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Image,
  ActivityIndicator,
  ScrollView,
  PermissionsAndroid,
} from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import { env } from '@/config'
import { uploadFile } from '@/utils'
import { Toast } from 'toastify-react-native'
import { communityService } from '../services'
import type { MoodType } from '../../home/types'

const moodOptions: {
  key: MoodType
  emoji: string
  label: string
  color: string
  bg: string
}[] = [
  { key: 'fine', emoji: '🟢', label: '还行', color: '#2E7D32', bg: '#E8F5E9' },
  {
    key: 'struggling',
    emoji: '🟡',
    label: '勉强',
    color: '#F57F17',
    bg: '#FFF8E1',
  },
  { key: 'bad', emoji: '🔴', label: '不太好', color: '#C62828', bg: '#FFEBEE' },
]

interface CreatePostInputProps {
  onPostCreated?: () => void
}

const MAX_IMAGES = 3

const CreatePostInput: React.FC<CreatePostInputProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [buttonScale] = useState(new Animated.Value(1))
  const [selectedImages, setSelectedImages] = useState<
    { uri: string; type: string; name: string }[]
  >([])
  const [uploading, setUploading] = useState(false)

  const maxLength = 120
  const currentLength = content.length
  const isSubmitDisabled = content.trim().length === 0 || uploading

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  const handleOpenModal = () => {
    setIsModalVisible(true)
  }

  const handleCloseModal = () => {
    Keyboard.dismiss()
    setIsModalVisible(false)
    setContent('')
    setIsAnonymous(false)
    setSelectedMood(null)
    setSelectedImages([])
  }

  const handlePickImage = async () => {
    if (selectedImages.length >= MAX_IMAGES) {
      Toast.info(`最多上传 ${MAX_IMAGES} 张图片`)
      return
    }
    // Android 需要申请存储权限（Android 13+ 用 READ_MEDIA_IMAGES）
    if (Platform.OS === 'android') {
      const permission =
        Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      const granted = await PermissionsAndroid.request(permission, {
        title: '存储权限',
        message: '需要访问相册来选择图片',
        buttonPositive: '确定',
      })
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Toast.error('需要存储权限才能选择图片')
        return
      }
    }
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: MAX_IMAGES - selectedImages.length,
        quality: 0.8,
      },
      response => {
        if (response.didCancel || !response.assets) return
        const newImages = response.assets
          .filter(a => a.uri)
          .map(a => ({
            uri: a.uri!,
            type: a.type ?? 'image/jpeg',
            name: a.fileName ?? `photo_${Date.now()}.jpg`,
          }))
        setSelectedImages(prev => [...prev, ...newImages].slice(0, MAX_IMAGES))
      },
    )
  }

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (content.trim().length === 0) {
      Toast.info('请输入内容后再发布')
      return
    }
    setUploading(true)
    try {
      const imageUrls: string[] = []
      for (const img of selectedImages) {
        const uploadResult = await uploadFile(`${env.HOST_API_URL}/file`, {
          uri: img.uri,
          type: img.type || 'image/jpeg',
          name: img.name || `photo_${Date.now()}.jpg`,
        })
        if (uploadResult.status !== 0) {
          Toast.error(uploadResult.message || '上传失败')
          return
        }
        imageUrls.push(`${env.HOST_API_URL}${uploadResult.data?.url}`)
      }
      const { status, message } = await communityService.createPost({
        content: content.trim(),
        isFromCheckIn: false,
        isAnonymous,
        mood: selectedMood ?? undefined,
        images: imageUrls,
      })
      if (status !== 0) {
        Toast.error(message)
        return
      }
      Keyboard.dismiss()
      setContent('')
      setSelectedImages([])
      setIsModalVisible(false)
      onPostCreated?.()
      Toast.success('发布成功')
    } catch (error: any) {
      console.log('发帖错误:', error)
      Toast.error(error?.message || '发布失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      {/* 悬浮按钮 - 粉色圆形+ */}
      <Animated.View
        style={[
          styles.floatingButton,
          {
            transform: [{ scale: buttonScale }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.floatingButtonInner}
          onPress={handleOpenModal}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Modal弹框 */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            style={styles.modalContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCloseModal}>
                <Text style={styles.cancelText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>分享想法</Text>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isSubmitDisabled && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={isSubmitDisabled}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>发布</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.inputContainer}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                style={styles.modalInput}
                value={content}
                onChangeText={setContent}
                placeholder="分享你的想法..."
                placeholderTextColor="#999"
                multiline
                maxLength={maxLength}
                textAlignVertical="top"
                autoFocus
              />

              {/* 图片预览区 */}
              {selectedImages.length > 0 && (
                <View style={styles.imageRow}>
                  {selectedImages.map((img, index) => (
                    <View key={index} style={styles.imageThumbWrapper}>
                      <Image
                        source={{ uri: img.uri }}
                        style={styles.imageThumb}
                      />
                      <TouchableOpacity
                        style={styles.imageRemoveBtn}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <Text style={styles.imageRemoveText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* 心情选择 */}
              <View style={styles.moodRow}>
                <Text style={styles.moodRowLabel}>心情</Text>
                {moodOptions.map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.moodChip,
                      selectedMood === opt.key && {
                        backgroundColor: opt.bg,
                        borderColor: opt.color,
                      },
                    ]}
                    onPress={() =>
                      setSelectedMood(prev =>
                        prev === opt.key ? null : opt.key,
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={styles.moodChipEmoji}>{opt.emoji}</Text>
                    <Text
                      style={[
                        styles.moodChipLabel,
                        selectedMood === opt.key && styles.moodChipLabelActive,
                        selectedMood === opt.key && { color: opt.color },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.bottomBar}>
                <View style={styles.bottomLeft}>
                  <TouchableOpacity
                    style={styles.anonymousToggle}
                    onPress={() => setIsAnonymous(prev => !prev)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.toggleDot,
                        isAnonymous && styles.toggleDotActive,
                      ]}
                    />
                    <Text
                      style={[
                        styles.anonymousText,
                        isAnonymous && styles.anonymousTextActive,
                      ]}
                    >
                      {isAnonymous ? '匿名发布' : '公开发布'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.imagePickerBtn,
                      selectedImages.length >= MAX_IMAGES &&
                        styles.imagePickerBtnDisabled,
                    ]}
                    onPress={handlePickImage}
                    disabled={selectedImages.length >= MAX_IMAGES}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.imagePickerIcon}>🖼</Text>
                    <Text style={styles.imagePickerText}>
                      {selectedImages.length}/{MAX_IMAGES}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text
                  style={[
                    styles.countText,
                    currentLength >= maxLength && styles.countTextWarning,
                  ]}
                >
                  {currentLength}/{maxLength}
                </Text>
              </View>
              {uploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="#5B54E4" size="small" />
                  <Text style={styles.uploadingText}>上传中...</Text>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#E84C5F',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E84C5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  floatingButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cancelText: {
    fontSize: 18,
    color: '#666',
    padding: 8,
  },
  modalHeaderLeft: {
    width: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalHeaderRight: {
    width: 40,
  },
  inputContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  modalInput: {
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  countText: {
    fontSize: 12,
    color: '#666',
  },
  countTextWarning: {
    color: '#ff6b6b',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#5B54E4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#c8c8c8',
  },
  submitButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  toggleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#bbb',
    marginRight: 6,
  },
  toggleDotActive: {
    backgroundColor: '#E84C5F',
  },
  anonymousText: {
    fontSize: 13,
    color: '#999',
  },
  anonymousTextActive: {
    color: '#E84C5F',
    fontWeight: '600',
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  moodRowLabel: {
    fontSize: 13,
    color: '#999',
    marginRight: 10,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    backgroundColor: '#F8F8F8',
    marginRight: 8,
  },
  moodChipEmoji: {
    fontSize: 13,
    marginRight: 4,
  },
  moodChipLabel: {
    fontSize: 13,
    color: '#666',
  },
  moodChipLabelActive: {
    fontWeight: '600',
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  imageThumbWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  imageRemoveBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E84C5F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageRemoveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  bottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  imagePickerBtnDisabled: {
    opacity: 0.4,
  },
  imagePickerIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  imagePickerText: {
    fontSize: 13,
    color: '#666',
  },
  uploadingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  uploadingText: {
    fontSize: 13,
    color: '#5B54E4',
  },
})

export default CreatePostInput
