import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { MoodType } from '../types'
import { useHomeStore } from '../stores'

interface MoodSelectorProps {
  selectedMood: MoodType | null
  onSelectMood: (mood: MoodType) => void
}

const formatDate = () => {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${month}月${day}日 ${weekDays[now.getDay()]}`
}

const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
}) => {
  const moodConfig = useHomeStore(s => s.moodConfig)

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>今天感觉怎么样？</Text>
        <Text style={styles.date}>{formatDate()}</Text>
      </View>
      <Text style={styles.subtitle}>轻轻点一下，告诉自己一声</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.moodGrid}
      >
        {(Object.keys(moodConfig) as MoodType[]).map(mood => {
          const cfg = moodConfig[mood]!
          const isSelected = selectedMood === mood
          return (
            <TouchableOpacity
              key={mood}
              style={[
                styles.moodItem,
                { backgroundColor: cfg.lightBg },
                isSelected && { borderColor: cfg.color, borderWidth: 2 },
              ]}
              onPress={() => onSelectMood(mood)}
              activeOpacity={0.7}
            >
              {isSelected && (
                <View
                  style={[styles.checkBadge, { backgroundColor: cfg.color }]}
                >
                  <Text style={styles.checkBadgeText}>✓</Text>
                </View>
              )}
              <View style={[styles.dotOuter, { borderColor: cfg.color }]}>
                <View
                  style={[styles.dotInner, { backgroundColor: cfg.color }]}
                />
              </View>
              <Text style={[styles.moodText, { color: cfg.color }]}>
                {cfg.text}
              </Text>
              <Text style={styles.moodDescription}>{cfg.description}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#FF6B7A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E84C5F',
  },
  date: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 6,
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 4,
  },
  moodItem: {
    width: 130,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  dotOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    backgroundColor: 'transparent',
  },
  dotInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  moodText: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  moodDescription: {
    fontSize: 12,
    color: '#999',
  },
})

export default MoodSelector
