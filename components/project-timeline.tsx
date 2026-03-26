import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

export interface TimelineEvent {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  isMilestone: boolean;
  milestoneStatus?: 'pending' | 'completed' | 'verified';
}

interface ProjectTimelineProps {
  events: TimelineEvent[];
  onVerifyMilestone?: (id: number) => void;
}

export function ProjectTimeline({ events, onVerifyMilestone }: ProjectTimelineProps) {
  return (
    <ScrollView style={styles.container}>
      {events.map((event, index) => (
        <View key={event.id} style={styles.eventWrapper}>
          <View style={styles.leftColumn}>
            <View style={[
              styles.dot,
              event.isMilestone ? styles.milestoneDot : styles.regularDot,
              event.milestoneStatus === 'completed' || event.milestoneStatus === 'verified' ? styles.completedDot : null
            ]} />
            {index < events.map.length - 1 && <View style={styles.line} />}
          </View>
          
          <View style={styles.contentColumn}>
            <View style={styles.header}>
              <Text style={[styles.title, event.isMilestone && styles.milestoneTitle]}>
                {event.isMilestone ? '🏆 ' : ''}{event.title}
              </Text>
              <Text style={styles.date}>{new Date(event.createdAt).toLocaleDateString()}</Text>
            </View>
            
            {event.description && (
              <Text style={styles.description}>{event.description}</Text>
            )}
            
            {event.isMilestone && event.milestoneStatus === 'completed' && onVerifyMilestone && (
              <TouchableOpacity 
                style={styles.verifyButton}
                onPress={() => onVerifyMilestone(event.id)}
              >
                <Text style={styles.verifyButtonText}>Verify Milestone</Text>
              </TouchableOpacity>
            )}
            
            {event.milestoneStatus === 'verified' && (
              <View style={styles.verifiedBadge}>
                <IconSymbol name="checkmark.seal.fill" size={14} color="#059669" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  eventWrapper: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  leftColumn: {
    alignItems: 'center',
    marginRight: 16,
    width: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  regularDot: {
    backgroundColor: '#94a3b8',
  },
  milestoneDot: {
    backgroundColor: '#3b82f6',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  completedDot: {
    backgroundColor: '#059669',
  },
  line: {
    position: 'absolute',
    top: 16,
    bottom: -24,
    width: 2,
    backgroundColor: '#e2e8f0',
  },
  contentColumn: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  milestoneTitle: {
    color: '#2563eb',
  },
  date: {
    fontSize: 12,
    color: '#64748b',
  },
  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  verifyButton: {
    marginTop: 12,
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#ecfdf5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
