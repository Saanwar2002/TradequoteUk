import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { IconSymbol } from './ui/icon-symbol';

export interface SmartMatch {
  id: number;
  name: string;
  businessName: string;
  rating: number;
  distance: number;
  matchScore: number;
  specialties?: string[];
  verified?: boolean;
}

interface SmartMatchingCardProps {
  matches: SmartMatch[];
  onSelectTradesperson?: (id: number) => void;
  colors: any;
}

export function SmartMatchingCard({ matches, onSelectTradesperson, colors }: SmartMatchingCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <IconSymbol name="sparkles" size={18} color={colors.primary} />
          <Text style={[styles.title, { color: colors.primary }]}>Smart Matches</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.muted }]}>{matches.length} recommended</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {matches.map((match) => (
          <Pressable
            key={match.id}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => onSelectTradesperson?.(match.id)}
          >
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
              <Text style={styles.avatarText}>{match.name.charAt(0)}</Text>
            </View>

            <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
              {match.name}
            </Text>
            <Text style={[styles.business, { color: colors.muted }]} numberOfLines={1}>
              {match.businessName}
            </Text>

            <View style={styles.stats}>
              <View style={styles.stat}>
                <IconSymbol name="star.fill" size={12} color="#F59E0B" />
                <Text style={[styles.statText, { color: colors.foreground }]}>{match.rating.toFixed(1)}</Text>
              </View>
              <View style={styles.stat}>
                <IconSymbol name="location.fill" size={12} color={colors.primary} />
                <Text style={[styles.statText, { color: colors.foreground }]}>{match.distance}mi</Text>
              </View>
            </View>

            <View style={[styles.matchScore, { backgroundColor: colors.primary + '10' }]}>
              <Text style={[styles.matchScoreText, { color: colors.primary }]}>
                {match.matchScore}% match
              </Text>
            </View>

            {match.verified && (
              <View style={styles.verifiedBadge}>
                <IconSymbol name="checkmark.seal.fill" size={12} color="#059669" />
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  card: {
    width: 140,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b82f6',
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  business: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    width: '100%',
    justifyContent: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    fontSize: 11,
    fontWeight: '600',
  },
  matchScore: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  matchScoreText: {
    fontSize: 11,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
