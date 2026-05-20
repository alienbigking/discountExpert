import React, { useMemo } from 'react'
import { FlatList, View, Text, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { EntryCard } from '@/components/entryCard'
import type { RootStackParamList } from '@/navigation/appNavigator'
import type { Entry, PlatformId } from '../types'

interface EntryListProps {
  entries: Entry[]
  selectedPlatform: PlatformId
  searchKeyword: string
}

const EntryList: React.FC<EntryListProps> = ({
  entries,
  selectedPlatform,
  searchKeyword,
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const filtered = useMemo(() => {
    return entries.filter(entry => {
      const matchPlatform =
        selectedPlatform === 'all' || entry.platform === selectedPlatform
      const matchSearch =
        !searchKeyword ||
        entry.title.includes(searchKeyword) ||
        entry.platformName.includes(searchKeyword)
      return matchPlatform && matchSearch
    })
  }, [entries, selectedPlatform, searchKeyword])

  const handleOpen = (entry: Entry) => {
    navigation.navigate('WebViewScreen', {
      url: entry.webFallback,
      title: entry.title,
      deeplink:
        entry.deeplink !== entry.webFallback ? entry.deeplink : undefined,
    })
  }

  if (filtered.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>暂无相关入口</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={filtered}
      keyExtractor={item => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <Text style={styles.listHeaderTitle}>热门入口</Text>
          <Text style={styles.listHeaderCount}>{filtered.length} 个入口</Text>
        </View>
      }
      renderItem={({ item }) => <EntryCard entry={item} onPress={handleOpen} />}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  row: {
    justifyContent: 'space-between',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  listHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.3,
  },
  listHeaderCount: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
})

export default EntryList
