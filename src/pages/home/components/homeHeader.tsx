import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

const HomeHeader: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>❤️</Text>
        </View>
        <Text style={styles.appName}>小美好</Text>
      </View>
      <Text style={styles.subtitle}>还在吗？·记录此刻的你</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE8EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logo: {
    fontSize: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#E84C5F',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 6,
  },
})

export default HomeHeader
