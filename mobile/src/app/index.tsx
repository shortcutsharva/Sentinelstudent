import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';

const actions = [
  { label: 'Revision Notes', icon: 'repeat' as const, color: '#9174FF', badge: 'NEW' },
  { label: 'Custom Practice', icon: 'target' as const, color: '#C56BFF' },
  { label: 'Improvement Book', icon: 'trending-up' as const, color: '#34C99A' },
  { label: 'Homework', icon: 'book-open' as const, color: '#F45C9F' },
  { label: 'Flashcards', icon: 'zap' as const, color: '#F1A247' },
  { label: 'Downloads', icon: 'download' as const, color: '#20B6D2' },
  { label: 'PYQ zone', icon: 'file-text' as const, color: '#6899F7' },
];

type Tab = {
  label: string;
  icon: 'home' | 'book' | 'users' | 'check-square' | 'coffee';
  active?: boolean;
  badge?: string;
  href?: string;
};

const tabs: Tab[] = [
  { label: 'Home', icon: 'home', active: true },
  { label: 'Study', icon: 'book' },
  { label: 'Mentorship', icon: 'users', badge: 'NEW', href: '/mentorship' },
  { label: 'Tests', icon: 'check-square' },
  { label: 'Break', icon: 'coffee' },
];

function SectionTitle({ title, trailing }: { title: string; trailing?: string }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {trailing ? <Text style={styles.trailingText}>{trailing}</Text> : null}
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 116 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.whatsNew}>
          <Feather name="zap" size={15} color="#398BFF" />
          <Text style={styles.whatsNewText}>WHAT&apos;S NEW</Text>
        </View>

        <View style={styles.courseRow}>
          <View style={styles.courseInfo}>
            <View style={styles.chipRow}>
              <Text style={styles.courseChip}>11th</Text>
              <Text style={styles.courseChip}>JEE Adv.</Text>
              <Text style={styles.courseChip}>Classroom</Text>
            </View>
            <View style={styles.changeCourse}>
              <Text style={styles.changeCourseText}>Change course</Text>
              <Feather name="play" size={14} color="#348BFF" />
            </View>
          </View>
          <Feather name="user" size={26} color="#F5F5F5" />
        </View>

        <View style={styles.quickActions}>
          <SectionTitle title="Quick Actions" />
          <View style={styles.actionGrid}>
            {actions.map((action) => (
              <View key={action.label} style={styles.actionItem}>
                <View style={styles.actionTile}>
                  <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                    <Feather name={action.icon} size={24} color="#FFFFFF" strokeWidth={2.8} />
                  </View>
                  {action.badge ? (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>{action.badge}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </View>
            ))}
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Broadcast, open the existing screen"
              onPress={() => router.push('/broadcast')}
              style={({ pressed }) => [styles.actionItem, pressed && styles.pressed]}
            >
              <View style={styles.broadcastGraphic}>
                <Feather name="volume-2" size={44} color="#C7D5E7" />
              </View>
              <Text style={styles.actionLabel}>Broadcast</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.scheduleSection}>
          <SectionTitle title="Schedule" />
          <View style={styles.scheduleCard}>
            <View style={styles.calendarIcon}>
              <Feather name="calendar" size={34} color="#77B4FF" />
            </View>
            <View style={styles.scheduleCopy}>
              <Text style={styles.scheduleTitle}>You&apos;re All Set!</Text>
              <Text style={styles.scheduleBody}>No more classes scheduled. Check your calendar for what&apos;s next!</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#F3F3F3" />
          </View>
        </View>

        <View style={styles.testsSection}>
          <SectionTitle title="Your tests" trailing="View all" />
          <View style={styles.testFilters}>
            <Text style={[styles.testFilter, styles.testFilterActive]}>Upcoming</Text>
            <Text style={styles.testFilter}>Past Tests</Text>
            <Text style={styles.testFilter}>Missed Tests</Text>
          </View>
          <View style={styles.testPreview} />
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        {tabs.map((tab) => {
          const content = (
            <>
              <View style={styles.tabIconWrap}>
                <Feather name={tab.icon} size={23} color={tab.active ? '#2787FF' : '#737373'} />
                {tab.badge ? (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.tabLabel, tab.active && styles.tabLabelActive]}>{tab.label}</Text>
            </>
          );

          if (!tab.href) {
            return (
              <View key={tab.label} style={styles.tabItem}>
                {content}
              </View>
            );
          }

          return (
            <Pressable
              key={tab.label}
              accessibilityRole="button"
              accessibilityLabel={`${tab.label} tab`}
              onPress={() => router.push(tab.href as '/mentorship')}
              style={({ pressed }) => [styles.tabItem, pressed && styles.pressed]}
            >
              {content}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#101010',
  },
  content: {
    paddingHorizontal: 20,
  },
  whatsNew: {
    alignSelf: 'center',
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingHorizontal: 17,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#282828',
    backgroundColor: '#1B1B1B',
  },
  whatsNewText: {
    color: '#398BFF',
    fontSize: 12,
    fontWeight: '700',
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
  },
  courseInfo: {
    gap: 11,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 5,
  },
  courseChip: {
    overflow: 'hidden',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: '#252525',
    color: '#F4F4F4',
    fontSize: 14,
    fontWeight: '600',
  },
  changeCourse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeCourseText: {
    color: '#388BFF',
    fontSize: 15,
    fontWeight: '600',
  },
  quickActions: {
    marginTop: 50,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#F4F4F4',
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  trailingText: {
    color: '#398BFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 20,
    marginTop: 24,
  },
  actionItem: {
    width: '23%',
    minHeight: 156,
    alignItems: 'center',
  },
  actionTile: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 94,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    borderBottomWidth: 6,
    borderBottomColor: '#3A3A3A',
    backgroundColor: '#202020',
  },
  actionIcon: {
    width: '57%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  newBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    backgroundColor: '#0867D7',
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  actionLabel: {
    marginTop: 9,
    color: '#D4D4D4',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  broadcastGraphic: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 94,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  scheduleSection: {
    marginTop: 37,
  },
  scheduleCard: {
    minHeight: 122,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 30,
    backgroundColor: '#222222',
  },
  calendarIcon: {
    width: 70,
    alignItems: 'center',
  },
  scheduleCopy: {
    flex: 1,
    gap: 8,
  },
  scheduleTitle: {
    color: '#F4F4F4',
    fontSize: 16,
    fontWeight: '700',
  },
  scheduleBody: {
    color: '#A7A7A7',
    fontSize: 14,
    lineHeight: 20,
  },
  testsSection: {
    marginTop: 70,
  },
  testFilters: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
  },
  testFilter: {
    overflow: 'hidden',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
    backgroundColor: '#242424',
    color: '#A5A5A5',
    fontSize: 14,
    fontWeight: '600',
  },
  testFilterActive: {
    backgroundColor: '#F4F4F4',
    color: '#161616',
  },
  testPreview: {
    height: 76,
    marginTop: 19,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: '#202020',
  },
  bottomBar: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    minHeight: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2C',
    backgroundColor: '#222222',
  },
  tabItem: {
    flex: 1,
    minHeight: 66,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  tabIconWrap: {
    minHeight: 27,
    justifyContent: 'center',
  },
  tabBadge: {
    position: 'absolute',
    top: -6,
    right: -20,
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: '#F26336',
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    color: '#777777',
    fontSize: 14,
  },
  tabLabelActive: {
    color: '#F0F0F0',
    fontWeight: '600',
  },
});
