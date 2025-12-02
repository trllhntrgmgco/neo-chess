// app/index.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VariantInfo {
  route: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  players: string;
}

const chessVariants: VariantInfo[] = [
  {
    route: '/game/neochess',
    name: 'Neo Chess',
    description: '..',
    difficulty: 'Beginner',
    players: '2-4 Players'
  },
];

export default function GameSelectionScreen() {
  const router = useRouter();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10b981';
      case 'Intermediate': return '#f59e0b';
      case 'Advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Game</Text>
        <Text style={styles.subtitle}>Select a chess variant to play</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {chessVariants.map((variant) => (
          <TouchableOpacity
            key={variant.route}
            style={styles.variantCard}
            onPress={() => router.push(variant.route as any)}
            activeOpacity={0.7}
          >
            <View style={styles.variantHeader}>
              <Text style={styles.variantName}>{variant.name}</Text>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(variant.difficulty) }]}>
                <Text style={styles.difficultyText}>{variant.difficulty}</Text>
              </View>
            </View>
            
            <Text style={styles.variantDescription}>{variant.description}</Text>
            
            <View style={styles.variantFooter}>
              <Text style={styles.playersText}>{variant.players}</Text>
              <Text style={styles.playNowText}>Play Now →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#262626',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  variantCard: {
    backgroundColor: '#262626',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#333',
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  variantName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  variantDescription: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
    marginBottom: 12,
  },
  variantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playersText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  playNowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
});