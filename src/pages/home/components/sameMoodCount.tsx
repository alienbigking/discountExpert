import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { MoodType } from '../types'
import { useHomeStore } from '../stores'

interface SameMoodCountProps {
  count: number
  mood: MoodType | null
}

const SameMoodCount: React.FC<SameMoodCountProps> = ({ count, mood }) => {
  const moodConfig = useHomeStore(s => s.moodConfig)
  if (!mood) return null

  const config = moodConfig[mood]

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <View style={styles.iconInner}>
          <Text style={styles.iconPeople}>👥</Text>
          <View style={styles.heartBadge}>
            <Text style={styles.heartText}>❤</Text>
          </View>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>
          今日有 <Text style={styles.count}>{count}</Text> 人
        </Text>
        <Text style={styles.description}>和你一样感到「{config.text}」</Text>
        <View style={styles.avatarRow}>
          <View style={[styles.miniDot, { backgroundColor: '#FF9AA2' }]} />
          <View
            style={[
              styles.miniDot,
              styles.miniDotOverlap,
              { backgroundColor: '#FF6B7A' },
            ]}
          />
          <View
            style={[
              styles.miniDot,
              styles.miniDotOverlap,
              { backgroundColor: config.color },
            ]}
          />
          <Text style={styles.tip}>你不是一个人</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF0F2',
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#E84C5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconInner: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPeople: {
    fontSize: 28,
    color: '#E84C5F',
  },
  heartBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E84C5F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  heartText: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  count: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E84C5F',
  },
  description: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginTop: 4,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  miniDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFF0F2',
  },
  miniDotOverlap: {
    marginLeft: -8,
  },
  tip: {
    fontSize: 13,
    color: '#888',
    marginLeft: 10,
  },
})

export default SameMoodCount
