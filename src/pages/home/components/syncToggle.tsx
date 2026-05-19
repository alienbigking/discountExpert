import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

interface SyncToggleProps {
  enabled: boolean
  onToggle: () => void
}

const SyncToggle: React.FC<SyncToggleProps> = ({ enabled, onToggle }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>同步到社区</Text>
          <Text style={styles.description}>
            打卡后自动分享到社区，让更多人看到你的状态
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.toggle, enabled && styles.toggleEnabled]}
          onPress={onToggle}
          activeOpacity={0.8}
        >
          <View
            style={[styles.toggleCircle, enabled && styles.toggleCircleEnabled]}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#FF6B7A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  toggle: {
    width: 48,
    height: 28,
    backgroundColor: '#dee2e6',
    borderRadius: 14,
    justifyContent: 'center',
    padding: 2,
  },
  toggleEnabled: {
    backgroundColor: '#E84C5F',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleCircleEnabled: {
    alignSelf: 'flex-end',
  },
})

export default SyncToggle
