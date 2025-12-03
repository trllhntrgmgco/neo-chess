// app/game/neochess/index.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function NeoChessStart() {
  const router = useRouter();
  const [selectedPlayers, setSelectedPlayers] = useState(4);
  const [showRules, setShowRules] = useState(false);

  const handleStartGame = () => {
    router.push(`/game/neochess/game?players=${selectedPlayers}`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a2e', '#16213e', '#0a0a2e']}
        style={styles.background}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>NEO-CHESS</Text>
          <Text style={styles.subtitle}>4-Player Quantum Battle Arena</Text>
          <Text style={styles.tagline}>Evolve. Dominate. Conquer.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select Players</Text>
          <View style={styles.playerSelector}>
            {[2, 3, 4].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.playerButton,
                  selectedPlayers === num && styles.playerButtonActive,
                ]}
                onPress={() => setSelectedPlayers(num)}
              >
                <Text
                  style={[
                    styles.playerButtonText,
                    selectedPlayers === num && styles.playerButtonTextActive,
                  ]}
                >
                  {num}
                </Text>
                <Text
                  style={[
                    styles.playerButtonLabel,
                    selectedPlayers === num && styles.playerButtonLabelActive,
                  ]}
                >
                  Players
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartGame}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Start Game</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rulesButton}
            onPress={() => setShowRules(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.rulesButtonText}>📖 View Rules</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <Modal visible={showRules} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Neo-Chess Rules</Text>
            <ScrollView style={styles.rulesScroll}>
              <View style={styles.ruleSection}>
              <Text style={styles.ruleText}>• Each player starts with 1 Knight and 2 Pawns</Text>
              <Text style={styles.ruleText}>• Knights move 2 squares in any direction</Text>
              <Text style={styles.ruleText}>• Pawns move 1 square in any direction</Text>
              <Text style={styles.ruleText}>• Green squares are safe zones - no captures allowed</Text>
              <Text style={styles.ruleText}>• Reach the golden center to upgrade to Queen!</Text>
              <Text style={styles.ruleText}>• Last player standing wins!</Text>
              </View>

              <View style={styles.ruleSection}>
              </View>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowRules(false)}
            >
              <Text style={styles.closeButtonText}>Got It!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#9333ea',
    textShadowRadius: 20,
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#a0a0ff',
    marginTop: 8,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(147, 51, 234, 0.3)',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  playerSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  playerButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  playerButtonActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.3)',
    borderColor: '#9333ea',
    transform: [{ scale: 1.05 }],
  },
  playerButtonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#666',
  },
  playerButtonTextActive: {
    color: '#fff',
  },
  playerButtonLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  playerButtonLabelActive: {
    color: '#a0a0ff',
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#9333ea',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#9333ea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  rulesButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  rulesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  featureList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 15,
  },
  feature: {
    alignItems: 'center',
    width: '30%',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureText: {
    color: '#a0a0ff',
    fontSize: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxHeight: '85%',
    borderWidth: 2,
    borderColor: '#9333ea',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#9333ea',
    marginBottom: 20,
    textAlign: 'center',
  },
  rulesScroll: {
    marginBottom: 20,
  },
  ruleSection: {
    marginBottom: 20,
  },
  ruleSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  ruleText: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  closeButton: {
    backgroundColor: '#9333ea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});