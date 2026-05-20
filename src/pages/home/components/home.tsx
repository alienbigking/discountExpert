import React from 'react'
import { View, Text, TextInput, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useHomeStore } from '../stores'
import PlatformFilter from './platformFilter'
import EntryList from './entryList'
import HomeBackground from '@/components/homeBackground'

const Home: React.FC = () => {
  const insets = useSafeAreaInsets()
  const selectedPlatform = useHomeStore(s => s.selectedPlatform)
  const searchKeyword = useHomeStore(s => s.searchKeyword)
  const entries = useHomeStore(s => s.entries)
  const platforms = useHomeStore(s => s.platforms)
  const setSelectedPlatform = useHomeStore(s => s.setSelectedPlatform)
  const setSearchKeyword = useHomeStore(s => s.setSearchKeyword)

  return (
    <HomeBackground>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>优惠入口</Text>
          <Text style={styles.subtitle}>一键直达官方活动页</Text>
        </View>

        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="搜索平台或入口名称"
            placeholderTextColor="#AEAEB2"
            value={searchKeyword}
            onChangeText={setSearchKeyword}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        <View style={styles.filterWrapper}>
          <PlatformFilter
            platforms={platforms}
            selected={selectedPlatform}
            onSelect={setSelectedPlatform}
          />
        </View>

        <EntryList
          entries={entries}
          selectedPlatform={selectedPlatform}
          searchKeyword={searchKeyword}
        />
      </View>
    </HomeBackground>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A3320',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#3A5A3A',
    marginTop: 3,
    fontWeight: '500',
  },
  searchWrapper: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 14,
    color: '#1A3320',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  filterWrapper: {
    marginBottom: 12,
  },
})

export default Home
