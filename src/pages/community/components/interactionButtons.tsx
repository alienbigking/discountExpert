import React, { useRef } from 'react'
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useCommunityStore } from '../stores'
import type { InteractionType } from '../types'
import { useSettingsStore } from '@/pages/settings/stores'
import { communityService } from '../services'

interface InteractionButtonsProps {
  postId: string
  interactions: {
    same: number
    hug: number
    lieDown: number
  }
  myInteractions?: {
    same?: boolean
    hug?: boolean
    lieDown?: boolean
  }
  onInteracted?: (type: InteractionType) => void
}

const InteractionButtons: React.FC<InteractionButtonsProps> = ({
  postId,
  interactions,
  myInteractions,
  onInteracted,
}) => {
  const { updatePost } = useCommunityStore()
  const allowInteraction = useSettingsStore(s => s.allowInteraction)

  const scales = useRef<Record<InteractionType, Animated.Value>>({
    same: new Animated.Value(1),
    hug: new Animated.Value(1),
    lieDown: new Animated.Value(1),
  }).current

  const handleInteraction = async (type: InteractionType) => {
    console.log('互动请求参数:', { postId, type })

    try {
      await communityService.interactPost(postId, type)
      updatePost(postId, {
        interactions: {
          ...interactions,
          [type]: (interactions?.[type] || 0) + 1,
        },
      })
      onInteracted?.(type)
    } catch (error) {
      console.error('互动失败:', error)
    }
  }

  const getInteractionConfig = (type: InteractionType) => {
    const configs = {
      same: { emoji: '🤝', text: '我也是', color: '#4CAF50' },
      hug: { emoji: '🫂', text: '抱一下', color: '#FF9800' },
      lieDown: { emoji: '🪦', text: '一起躺', color: '#9C27B0' },
    }
    return configs[type]
  }

  const handlePressIn = (type: InteractionType) => {
    Animated.spring(scales[type], {
      toValue: 0.75,
      useNativeDriver: true,
      tension: 150,
      friction: 10,
    }).start()
  }

  const handlePressOut = (type: InteractionType) => {
    Animated.spring(scales[type], {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 10,
    }).start()
  }

  return (
    <View style={styles.container}>
      {(['same', 'hug', 'lieDown'] as const).map(type => {
        const config = getInteractionConfig(type)
        const count = interactions?.[type] || 0

        return (
          <Animated.View
            key={`interaction-${type}`}
            style={{ transform: [{ scale: scales[type] }] }}
          >
            <TouchableOpacity
              style={[styles.button, { backgroundColor: `${config.color}15` }]}
              onPress={() => handleInteraction(type)}
              onPressIn={() => handlePressIn(type)}
              onPressOut={() => handlePressOut(type)}
              activeOpacity={0.5}
            >
              <Text style={[styles.emoji, { color: config.color }]}>
                {config.emoji}
              </Text>
              <Text style={[styles.count, { color: config.color }]}>
                {count}
              </Text>
              {/* <Text style={styles.text}>
                {config.text}
              </Text> */}
            </TouchableOpacity>
          </Animated.View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    minWidth: 40,
    backgroundColor: '#f8f9fa',
  },
  buttonSelected: {
    borderWidth: 1.5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  emoji: {
    fontSize: 12,
    marginBottom: 1,
  },
  count: {
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 1,
  },
  text: {
    fontSize: 7,
    color: '#666',
  },
})

export default InteractionButtons
