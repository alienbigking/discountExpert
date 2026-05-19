import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { MoodType } from '../../home/types'

interface MoodFilterTabsProps {
  selectedMood: MoodType | 'all'
  onSelectMood: (mood: MoodType | 'all') => void
}

const moodFilters: {
  key: MoodType | 'all'
  label: string
  color: string
  dotColor: string
}[] = [
  { key: 'all', label: '全部', color: '#F5F5F5', dotColor: '#999' },
  { key: 'fine', label: '还行', color: '#E8F5E9', dotColor: '#4CAF50' },
  { key: 'struggling', label: '勉强', color: '#FFF8E1', dotColor: '#FFC107' },
  { key: 'bad', label: '不太好', color: '#FFEBEE', dotColor: '#E84C5F' },
  {
    key: 'undefined',
    label: '不想定义',
    color: '#F5F5F5',
    dotColor: '#9E9E9E',
  },
]

const MoodFilterTabs: React.FC<MoodFilterTabsProps> = ({
  selectedMood,
  onSelectMood,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {moodFilters.map(filter => {
        const isSelected = selectedMood === filter.key
        return (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.tab,
              isSelected && {
                backgroundColor: filter.key === 'all' ? '#333' : filter.color,
              },
            ]}
            onPress={() => onSelectMood(filter.key)}
            activeOpacity={0.8}
          >
            <View style={[styles.dot, { backgroundColor: filter.dotColor }]} />
            <Text
              style={[
                styles.label,
                isSelected && styles.labelSelected,
                isSelected && filter.key === 'bad' && { color: '#E84C5F' },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  labelSelected: {
    color: '#333',
    fontWeight: '600',
  },
})

export default MoodFilterTabs
