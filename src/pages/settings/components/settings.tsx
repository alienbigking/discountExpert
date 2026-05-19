import React from 'react'
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSettingsStore } from '../stores'
import AppBackground from '@/components/appBackground'

const Settings: React.FC = () => {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const {
    syncToCommunity,
    allowInteraction,
    appBackground,
    toggleSyncToCommunity,
    toggleAllowInteraction,
    setAppBackground,
  } = useSettingsStore()

  const bgPresets = [
    { color: '#FFF5F6', label: '玫瑰白' },
    { color: '#F5F0FF', label: '薰衣草' },
    { color: '#F0F7FF', label: '天空蓝' },
    { color: '#F0FFF4', label: '薄荷绿' },
    { color: '#FFFBF0', label: '奶油黄' },
    { color: '#F5F5F5', label: '纯浅灰' },
  ]

  return (
    <AppBackground style={{ paddingTop: insets.top }}>
      <View style={[styles.header, { backgroundColor: appBackground }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>⚙️ 设置</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, styles.sectionGap]}>
          <Text style={styles.sectionTitle}>外观</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>背景色</Text>
              <Text style={styles.settingDesc}>自定义 App 页面背景色</Text>
            </View>
          </View>
          <View style={styles.colorRow}>
            {bgPresets.map(preset => (
              <TouchableOpacity
                key={preset.color}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: preset.color },
                  appBackground === preset.color && styles.colorSwatchSelected,
                ]}
                onPress={() => setAppBackground(preset.color)}
                activeOpacity={0.8}
              >
                {appBackground === preset.color && (
                  <Text style={styles.colorCheck}>✓</Text>
                )}
                <Text style={styles.colorLabel}>{preset.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>隐私</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>同步到社区</Text>
              <Text style={styles.settingDesc}>打卡后自动同步到社区</Text>
            </View>
            <Switch
              value={syncToCommunity}
              onValueChange={toggleSyncToCommunity}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>允许互动</Text>
              <Text style={styles.settingDesc}>关闭后将无法进行共鸣互动</Text>
            </View>
            <Switch
              value={allowInteraction}
              onValueChange={toggleAllowInteraction}
            />
          </View>
        </View>
      </ScrollView>
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
    padding: 24,
  },
  section: {
    gap: 12,
  },
  sectionGap: {
    marginBottom: 28,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorSwatch: {
    width: 72,
    height: 72,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchSelected: {
    borderColor: '#E84C5F',
    borderWidth: 2.5,
  },
  colorCheck: {
    fontSize: 18,
    color: '#E84C5F',
    fontWeight: '700',
  },
  colorLabel: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  settingText: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 13,
    color: '#666',
  },
})

export default Settings
