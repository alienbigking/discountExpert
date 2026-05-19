import React, { useState } from 'react'
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native'

interface CheckInButtonProps {
  onCheckIn: () => void
  loading?: boolean
  disabled?: boolean
}

const CheckInButton: React.FC<CheckInButtonProps> = ({
  onCheckIn,
  loading = false,
  disabled = false,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1))

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 4,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start()
  }

  const isDisabled = disabled || loading

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.button, isDisabled && styles.disabledButton]}
        onPress={onCheckIn}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.9}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>✓ 完成今日打卡</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    width: 200,
    borderRadius: 28,
    backgroundColor: '#E84C5F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#E84C5F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#F0B0B8',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 1,
  },
})

export default CheckInButton
