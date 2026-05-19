import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { MoodType } from '../types'
import { useHomeStore } from '../stores'

interface CurrentMoodDisplayProps {
  mood: MoodType
  checkInStreak: number
}

const CurrentMoodDisplay: React.FC<CurrentMoodDisplayProps> = ({
  mood,
  checkInStreak,
}) => {
  const moodConfig = useHomeStore(s => s.moodConfig)
  const config = moodConfig[mood]

  return (
    <View style={styles.container}>
      <View style={styles.moodCard}>
        <Text style={styles.emoji}>{config.emoji}</Text>
        <Text style={styles.statusText}>{config.text}</Text>
      </View>

      <View style={styles.streakContainer}>
        <Text style={styles.streakText}>
          已连续打卡 <Text style={styles.streakNumber}>{checkInStreak}</Text> 天
        </Text>
      </View>

      <View style={styles.completedContainer}>
        <Text style={styles.completedText}>✅ 今日已完成打卡</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  moodCard: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  streakContainer: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  streakText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '500',
  },
  streakNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#856404',
  },
  completedContainer: {
    backgroundColor: '#d4edda',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  completedText: {
    fontSize: 14,
    color: '#155724',
    fontWeight: '500',
  },
})

export default CurrentMoodDisplay
