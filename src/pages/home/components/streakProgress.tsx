import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface CheckInRecord {
  checkInDate: string // YYYY-MM-DD
}

interface StreakProgressProps {
  streak: number
  total: number
  history?: CheckInRecord[] // 本周打卡历史记录
}

const MILESTONES = [10, 30, 60, 100]
const MILESTONE_LABELS: Record<number, string> = {
  10: '十日坚持',
  30: '一月同行',
  60: '两月陶冶',
  100: '百日达人',
}

const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日']

const StreakProgress: React.FC<StreakProgressProps> = ({
  streak,
  total,
  history = [],
}) => {
  const nextMilestone = MILESTONES.find(m => total < m) || null
  const prevMilestone = nextMilestone
    ? MILESTONES[MILESTONES.indexOf(nextMilestone) - 1] || 0
    : MILESTONES[MILESTONES.length - 1]

  const progress = nextMilestone
    ? (total - prevMilestone) / (nextMilestone - prevMilestone)
    : 1

  const remain = nextMilestone ? nextMilestone - total : 0

  // 获取本周日期列表（周一到周日），使用本地时间格式化避免时区问题
  const getWeekDates = () => {
    const today = new Date()
    const currentDay = today.getDay() // 0=周日, 1=周一...
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay // 到周一的偏移量
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)
    monday.setHours(0, 0, 0, 0)

    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const dates: string[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      dates.push(formatDate(d)) // YYYY-MM-DD (本地时间)
    }
    return dates
  }

  const weekDates = getWeekDates()
  const checkedDates = new Set(history.map(h => h.checkInDate))

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🔥</Text>
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>
            累计打卡 <Text style={styles.streak}>{total}</Text> 天
          </Text>
          <Text style={styles.subtitle}>
            {remain > 0
              ? `再坚持 ${remain} 天解锁「${MILESTONE_LABELS[nextMilestone!]}」`
              : '🏅 所有里程碑已达成！'}
          </Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakBadgeText}>🔥{streak}</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.weekRow}>
        {WEEK_LABELS.map((label, idx) => {
          const isChecked = checkedDates.has(weekDates[idx])
          return (
            <View
              key={label}
              style={[styles.weekDot, isChecked && styles.weekDotActive]}
            >
              <Text
                style={[styles.weekText, isChecked && styles.weekTextActive]}
              >
                {label}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 24,
    shadowColor: '#FF6B7A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FF8A4C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  streak: {
    color: '#E84C5F',
    fontWeight: '800',
    fontSize: 17,
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  streakBadge: {
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  streakBadgeText: {
    fontSize: 13,
    color: '#FF8A4C',
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#FFE8EB',
    borderRadius: 3,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E84C5F',
    borderRadius: 3,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  weekDot: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFE8EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDotActive: {
    backgroundColor: '#E84C5F',
  },
  weekText: {
    fontSize: 12,
    color: '#E84C5F',
    fontWeight: '600',
  },
  weekTextActive: {
    color: '#FFFFFF',
  },
})

export default StreakProgress
