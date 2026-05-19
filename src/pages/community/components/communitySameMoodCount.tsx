import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface CommunitySameMoodCountProps {
  count: number
}

const CommunitySameMoodCount: React.FC<CommunitySameMoodCountProps> = ({
  count,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.heartIcon}>
        <Text style={styles.heartEmoji}>❤️</Text>
      </View>
      <Text style={styles.text}>
        此刻有 <Text style={styles.highlight}>{count.toLocaleString()}</Text>{' '}
        人和你一样
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF5F7',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  heartIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFE4E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  heartEmoji: {
    fontSize: 14,
  },
  text: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  highlight: {
    fontSize: 16,
    color: '#E84C5F',
    fontWeight: '700',
  },
})

export default CommunitySameMoodCount
