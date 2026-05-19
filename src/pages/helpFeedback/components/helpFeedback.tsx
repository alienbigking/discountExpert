import React, { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Toast } from 'toastify-react-native'
import { useHelpFeedbackStore } from '../stores'
import { helpFeedbackService } from '../services'
import AppBackground from '@/components/appBackground'
import { useSettingsStore } from '@/pages/settings/stores'

const HelpFeedback: React.FC = () => {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const { loading, setLoading } = useHelpFeedbackStore()
  const appBackground = useSettingsStore(s => s.appBackground)

  const [contact, setContact] = useState('')
  const [content, setContent] = useState('')

  const canSubmit = useMemo(
    () => content.trim().length > 0 && !loading,
    [content, loading],
  )

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    try {
      const { status, message } = await helpFeedbackService.submitFeedback({
        content: content.trim(),
        contact: contact.trim() || undefined,
      })
      if (status !== 0) {
        Toast.error(message)
        return
      }
      setContent('')
      setContact('')
      Keyboard.dismiss()
      Toast.success('已提交，感谢反馈')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <View style={[styles.header, { backgroundColor: appBackground }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>❓ 帮助与反馈</Text>
        <View style={styles.headerRight} />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.content}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.sectionTitle}>常见问题</Text>

            <View style={styles.faqItem}>
              <Text style={styles.faqQ}>Q：同步到社区是什么？</Text>
              <Text style={styles.faqA}>
                开启后，你的打卡会自动生成一条社区帖子。
              </Text>
            </View>
            <View style={styles.faqItem}>
              <Text style={styles.faqQ}>Q：关闭允许互动会怎样？</Text>
              <Text style={styles.faqA}>
                关闭后，你无法进行“共鸣互动”，按钮会变灰。
              </Text>
            </View>

            <Text style={[styles.sectionTitle, styles.sectionTitleSpacingTop]}>
              反馈
            </Text>

            <TextInput
              value={contact}
              onChangeText={setContact}
              placeholder="联系方式（可选：微信/邮箱）"
              placeholderTextColor="#aaa"
              style={styles.input}
            />
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="请描述你的问题或建议"
              placeholderTextColor="#aaa"
              style={[styles.input, styles.textarea]}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text
                  style={[
                    styles.submitText,
                    !canSubmit && styles.submitTextDisabled,
                  ]}
                >
                  提交
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </AppBackground>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    width: 72,
  },
  backText: {
    fontSize: 16,
    color: '#E84C5F',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  headerRight: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#333',
    marginBottom: 10,
  },
  sectionTitleSpacingTop: {
    marginTop: 20,
  },
  faqItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  faqQ: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  faqA: {
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  textarea: {
    height: 140,
  },
  submitBtn: {
    marginTop: 6,
    backgroundColor: '#5B54E4',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#E1E1F6',
  },
  submitText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  submitTextDisabled: {
    color: '#fff',
  },
})

export default HelpFeedback
