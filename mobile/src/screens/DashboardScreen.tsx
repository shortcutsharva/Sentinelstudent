import { useState, type ComponentProps } from 'react'
import { Feather, Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

type IconName = ComponentProps<typeof Feather>['name']
type Category = 'batches' | 'homework' | 'fees'

type Notice = {
  id: string
  tag: string
  tagIcon: IconName
  accent: string
  tagBg: string
  tagColor: string
  subject: string
  time: string
  timePill?: boolean
  title: string
  body: string
  footerIcon?: IconName
  footerText: string
  badge?: boolean
  action: string
  actionIcon: IconName
  score?: { value: string; total: string }
  category: Category
}

const NOTICES: Notice[] = [
  {
    id: 'schedule-shift',
    tag: 'Schedule Shift',
    tagIcon: 'calendar',
    accent: '#F59E0B',
    tagBg: '#FEF3C7',
    tagColor: '#B45309',
    subject: 'A-Level Maths T-3',
    time: '15m ago',
    title: 'Calculus Mock Test Schedule Moved to Saturday 4:00 PM',
    body: 'Sir Rahman has shifted Session 4 revision due to school sports day. Prepare your formula booklet and past paper series 2.',
    footerIcon: 'map-pin',
    footerText: 'Lecture Hall 4A',
    action: 'Add to Calendar',
    actionIcon: 'arrow-right',
    category: 'batches',
  },
  {
    id: 'graded-result',
    tag: 'Graded Result',
    tagIcon: 'clipboard',
    accent: '#3B82F6',
    tagBg: '#DBEAFE',
    tagColor: '#1D4ED8',
    subject: 'Physics HL',
    time: '1h ago',
    title: 'Mechanics Problem Sheet 5 Graded',
    body: "Feedback uploaded: Excellent work on circular motion questions. Please review question 4(b) error before tomorrow's doubt class.",
    footerText: 'Top 5% in Batch',
    badge: true,
    action: 'Review Sheet',
    actionIcon: 'arrow-right',
    score: { value: '96', total: '100' },
    category: 'homework',
  },
  {
    id: 'doubt-slot',
    tag: '1-on-1 Doubt Slot',
    tagIcon: 'video',
    accent: '#3B82F6',
    tagBg: '#DBEAFE',
    tagColor: '#1D4ED8',
    subject: 'Chemistry',
    time: '3h ago',
    title: 'Organic Doubt Clearing Slot Confirmed',
    body: 'Your requested 30-minute Organic Chemistry doubt session with Ms. Clara is scheduled for Thursday at 5:30 PM (Room 2B).',
    footerIcon: 'book-open',
    footerText: 'Ms. Clara • Room 2B',
    action: 'Pass & QR',
    actionIcon: 'download',
    category: 'batches',
  },
  {
    id: 'tuition-notice',
    tag: 'Tuition Notice',
    tagIcon: 'file-text',
    accent: '#6366F1',
    tagBg: '#E0E7FF',
    tagColor: '#4338CA',
    subject: 'Administration',
    time: 'Tomorrow 10:00 AM',
    timePill: true,
    title: 'Term 2 Tuition Invoice & Revision Material Pickup',
    body: 'Please collect printed question packs and confirm fee clearance at the administrative counter on floor 1.',
    footerIcon: 'inbox',
    footerText: 'Receipt Pending',
    action: 'Pay / Inquire',
    actionIcon: 'arrow-right',
    category: 'fees',
  },
]

const FILTERS: { key: 'all' | Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'batches', label: 'Batches & Streams' },
  { key: 'homework', label: 'Homework' },
  { key: 'fees', label: 'Fees' },
]

function TagPill({ notice }: { notice: Notice }) {
  return (
    <View style={[styles.tagPill, { backgroundColor: notice.tagBg }]}>
      <Feather name={notice.tagIcon} size={11} color={notice.tagColor} />
      <Text style={[styles.tagText, { color: notice.tagColor }]}>{notice.tag}</Text>
    </View>
  )
}

function NoticeCard({ notice }: { notice: Notice }) {
  return (
    <View style={styles.cardWrap}>
      <View style={styles.card}>
        <View style={[styles.accentBar, { backgroundColor: notice.accent }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <TagPill notice={notice} />
            <Text style={styles.subject} numberOfLines={1}>
              • {notice.subject}
            </Text>
            {notice.timePill ? (
              <View style={styles.timePill}>
                <Text style={styles.timePillText}>{notice.time}</Text>
              </View>
            ) : (
              <View style={styles.timeRow}>
                <Feather name="clock" size={11} color="#94A3B8" />
                <Text style={styles.timeRowText}>{notice.time}</Text>
              </View>
            )}
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.title}>{notice.title}</Text>
            {notice.score && (
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreValue}>{notice.score.value}</Text>
                <Text style={styles.scoreTotal}>/{notice.score.total}</Text>
              </View>
            )}
          </View>

          <Text style={styles.body}>{notice.body}</Text>

          <View style={styles.cardFooter}>
            {notice.badge ? (
              <View style={styles.badge}>
                <Feather name="check-circle" size={11} color="#15803D" />
                <Text style={styles.badgeText}>{notice.footerText}</Text>
              </View>
            ) : (
              <View style={styles.footerLeft}>
                <Feather name={notice.footerIcon} size={12} color="#94A3B8" />
                <Text style={styles.footerText}>{notice.footerText}</Text>
              </View>
            )}
            <Pressable style={styles.action} hitSlop={6}>
              <Text style={styles.actionText}>{notice.action}</Text>
              <Feather name={notice.actionIcon} size={13} color="#2563EB" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  )
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets()
  const [filter, setFilter] = useState<'all' | Category>('all')
  const notices = filter === 'all' ? NOTICES : NOTICES.filter((n) => n.category === filter)

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.logo}>
          <Ionicons name="school" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.headerTitles}>
          <View style={styles.brandRow}>
            <Text style={styles.brand}>ALLEN INSTITUTE</Text>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live Batch</Text>
            </View>
          </View>
          <Text style={styles.portal}>Student Portal · Year 2025</Text>
        </View>
        <Pressable style={styles.iconButton} hitSlop={6}>
          <Feather name="bell" size={18} color="#334155" />
        </Pressable>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>M</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.greetCard}>
          <View style={styles.greetTop}>
            <View style={styles.greetLabel}>
              <Ionicons name="sparkles" size={13} color="#2563EB" />
              <Text style={styles.greetLabelText}>ACADEMIC DASHBOARD</Text>
            </View>
            <View style={styles.unreadPill}>
              <View style={styles.unreadDot} />
              <Text style={styles.unreadText}>3 Unread</Text>
            </View>
          </View>
          <Text style={styles.greeting}>Good morning, Maya</Text>
          <Text style={styles.greetSub}>
            You have 3 critical announcements regarding weekly tutorials and
            upcoming mock tests.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                {f.key === 'all' && (
                  <Feather
                    name="grid"
                    size={12}
                    color={active ? '#FFFFFF' : '#64748B'}
                  />
                )}
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {f.key === 'all' ? `All (${NOTICES.length})` : f.label}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>

        {notices.map((notice) => (
          <NoticeCard key={notice.id} notice={notice} />
        ))}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable style={styles.typeButton}>
          <Feather name="image" size={16} color="#2563EB" />
          <Text style={styles.typeText}>Type</Text>
        </Pressable>
        <Pressable style={styles.micButton}>
          <Feather name="mic" size={26} color="#FFFFFF" />
        </Pressable>
        <Pressable style={styles.headsetButton}>
          <Feather name="headphones" size={20} color="#1D4ED8" />
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F3F6FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brand: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  liveText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803D',
  },
  portal: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  scroll: {
    paddingTop: 10,
    paddingBottom: 140,
  },
  greetCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  greetTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greetLabelText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.8,
  },
  unreadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EDF2FB',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  greeting: {
    fontSize: 25,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    letterSpacing: -0.3,
  },
  greetSub: {
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 20,
    marginTop: 8,
  },
  chips: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  cardWrap: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 106,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tagText: {
    flex: 1,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  subject: {
    flex: 1,
    fontSize: 11,
    color: '#94A3B8',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeRowText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  timePill: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 10,
  },
  title: {
    flex: 1,
    fontSize: 16.5,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  scoreValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  scoreTotal: {
    fontSize: 11,
    color: '#94A3B8',
  },
  body: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginTop: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
  },
  footerText: {
    fontSize: 11.5,
    color: '#64748B',
    flexShrink: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#15803D',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    backgroundColor: '#F3F6FC',
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -8 }],
    shadowColor: '#2563EB',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  headsetButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
})
