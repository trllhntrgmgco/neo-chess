import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SQUARE_SIZE = Math.floor((SCREEN_WIDTH - 60) / 9);

type PieceType = 'PAWN' | 'KNIGHT' | 'QUEEN' | 'ROOK';

interface Piece {
  type: PieceType;
  player: number;
  upgraded?: boolean;
}

interface Position {
  row: number;
  col: number;
}

interface Player {
  pieces: number;
  captures: number;
  upgrades: number;
  eliminated: boolean;
  ai: boolean;
  color: string;
  active: boolean;
}

interface GameState {
  board: (Piece | null)[][];
  currentPlayer: number;
  players: Record<number, Player>;
  selectedPiece: Position | null;
  validMoves: Position[];
  gameActive: boolean;
  aiSpeed: number;
  numPlayers: number;
}

const PIECES = {
  PAWN: '♟',
  KNIGHT: '♞',
  QUEEN: '♛',
  ROOK: '♜',
};

const PLAYER_COLORS = {
  1: '#ff0000',
  2: '#00ff00',
  3: '#0000ff',
  4: '#ffff00',
};

export default function NeoChessGame() {
  const router = useRouter();
  const { players } = useLocalSearchParams();
  const numPlayers = parseInt(players as string) || 4;

  const [gameState, setGameState] = useState<GameState>({
    board: [],
    currentPlayer: 1,
    players: {
      1: { pieces: 3, captures: 0, upgrades: 0, eliminated: false, ai: false, color: PLAYER_COLORS[1], active: true },
      2: { pieces: 3, captures: 0, upgrades: 0, eliminated: false, ai: true, color: PLAYER_COLORS[2], active: true },
      3: { pieces: 3, captures: 0, upgrades: 0, eliminated: false, ai: true, color: PLAYER_COLORS[3], active: numPlayers >= 3 },
      4: { pieces: 3, captures: 0, upgrades: 0, eliminated: false, ai: true, color: PLAYER_COLORS[4], active: numPlayers >= 4 },
    },
    selectedPiece: null,
    validMoves: [],
    gameActive: false,
    aiSpeed: 1000,
    numPlayers,
  });

  const [showRules, setShowRules] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);

  const initializeGame = useCallback(() => {
    const board: (Piece | null)[][] = Array(9).fill(null).map(() => Array(9).fill(null));

    // Place center rooks (neutral)
    board[3][4] = { type: 'ROOK', player: 0 };
    board[5][4] = { type: 'ROOK', player: 0 };
    board[4][3] = { type: 'ROOK', player: 0 };
    board[4][5] = { type: 'ROOK', player: 0 };

    // Player 1 (Red) - Top Left - Always active
    board[0][0] = { type: 'KNIGHT', player: 1 };
    board[1][0] = { type: 'PAWN', player: 1 };
    board[0][1] = { type: 'PAWN', player: 1 };

    // Player 2 (Green) - Top Right - Always active
    board[0][8] = { type: 'KNIGHT', player: 2 };
    board[0][7] = { type: 'PAWN', player: 2 };
    board[1][8] = { type: 'PAWN', player: 2 };

    // Player 3 (Blue) - Bottom Right - Optional
    if (numPlayers >= 3) {
      board[8][8] = { type: 'KNIGHT', player: 3 };
      board[7][8] = { type: 'PAWN', player: 3 };
      board[8][7] = { type: 'PAWN', player: 3 };
    }

    // Player 4 (Yellow) - Bottom Left - Optional
    if (numPlayers >= 4) {
      board[8][0] = { type: 'KNIGHT', player: 4 };
      board[8][1] = { type: 'PAWN', player: 4 };
      board[7][0] = { type: 'PAWN', player: 4 };
    }

    setGameState({
      board,
      currentPlayer: 1,
      players: {
        1: { pieces: 3, captures: 0, upgrades: 0, eliminated: false, ai: false, color: PLAYER_COLORS[1], active: true },
        2: { pieces: 3, captures: 0, upgrades: 0, eliminated: false, ai: true, color: PLAYER_COLORS[2], active: true },
        3: { pieces: 3, captures: 0, upgrades: 0, eliminated: false, ai: true, color: PLAYER_COLORS[3], active: numPlayers >= 3 },
        4: { pieces: 3, captures: 0, upgrades: 0, eliminated: false, ai: true, color: PLAYER_COLORS[4], active: numPlayers >= 4 },
      },
      selectedPiece: null,
      validMoves: [],
      gameActive: true,
      aiSpeed: 1000,
      numPlayers,
    });
    setWinner(null);
  }, [numPlayers]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const isSafeSquare = (row: number, col: number): boolean => {
    return (row === 0 && col === 4) || (row === 8 && col === 4) || 
           (row === 4 && col === 0) || (row === 4 && col === 8);
  };

  const isInBounds = (row: number, col: number): boolean => {
    return row >= 0 && row < 9 && col >= 0 && col < 9;
  };

  const getValidMoves = (row: number, col: number): Position[] => {
    const piece = gameState.board[row][col];
    if (!piece) return [];

    const moves: Position[] = [];

    if (piece.type === 'PAWN' || piece.type === 'QUEEN') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const newRow = row + dr;
          const newCol = col + dc;

          if (isInBounds(newRow, newCol)) {
            const target = gameState.board[newRow][newCol];

            if (target && isSafeSquare(newRow, newCol)) continue;

            if (!target || (target.player > 0 && target.player !== piece.player)) {
              moves.push({ row: newRow, col: newCol });
            }
          }
        }
      }
    }

    if (piece.type === 'KNIGHT' || piece.type === 'QUEEN') {
      const knightMoves = [
        [-2, 0], [2, 0], [0, -2], [0, 2],
        [-2, -2], [-2, 2], [2, -2], [2, 2],
        [-2, -1], [-2, 1], [2, -1], [2, 1],
        [-1, -2], [1, -2], [-1, 2], [1, 2]
      ];

      knightMoves.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;

        if (isInBounds(newRow, newCol)) {
          const target = gameState.board[newRow][newCol];

          if (target && isSafeSquare(newRow, newCol)) return;

          if (!target || (target.player > 0 && target.player !== piece.player)) {
            moves.push({ row: newRow, col: newCol });
          }
        }
      });
    }

    return moves;
  };

  const makeMove = (from: Position, to: Position) => {
    const newBoard = gameState.board.map(row => [...row]);
    const piece = newBoard[from.row][from.col];
    const target = newBoard[to.row][to.col];

    if (!piece) return;

    const newPlayers = { ...gameState.players };

    // Handle capture
    if (target && target.player !== 0 && !isSafeSquare(to.row, to.col)) {
      newPlayers[gameState.currentPlayer].captures++;
      newPlayers[target.player].pieces--;

      if (newPlayers[target.player].pieces === 0) {
        newPlayers[target.player].eliminated = true;
      }
    }

    // Move piece
    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;

    // Check for center upgrade
    if (to.row === 4 && to.col === 4 && piece.type !== 'QUEEN') {
      piece.type = 'QUEEN';
      piece.upgraded = true;
      newPlayers[gameState.currentPlayer].upgrades++;
    }

    // Check for victory
    const activePlayers = Object.keys(newPlayers).filter(p => {
      const player = newPlayers[parseInt(p)];
      return player.active && !player.eliminated;
    });

    if (activePlayers.length === 1) {
      setWinner(parseInt(activePlayers[0]));
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        players: newPlayers,
        selectedPiece: null,
        validMoves: [],
        gameActive: false,
      }));
    } else {
      // Next turn
      let nextPlayer = (gameState.currentPlayer % 4) + 1;
      while (!newPlayers[nextPlayer].active || newPlayers[nextPlayer].eliminated) {
        nextPlayer = (nextPlayer % 4) + 1;
      }

      setGameState(prev => ({
        ...prev,
        board: newBoard,
        players: newPlayers,
        currentPlayer: nextPlayer,
        selectedPiece: null,
        validMoves: [],
      }));
    }
  };

  const handleSquarePress = (row: number, col: number) => {
    if (!gameState.gameActive) return;
    if (gameState.players[gameState.currentPlayer].ai) return;

    const piece = gameState.board[row][col];

    if (gameState.selectedPiece) {
      const isValid = gameState.validMoves.some(
        move => move.row === row && move.col === col
      );

      if (isValid) {
        makeMove(gameState.selectedPiece, { row, col });
      } else if (piece && piece.player === gameState.currentPlayer) {
        const moves = getValidMoves(row, col);
        setGameState(prev => ({
          ...prev,
          selectedPiece: { row, col },
          validMoves: moves,
        }));
      } else {
        setGameState(prev => ({
          ...prev,
          selectedPiece: null,
          validMoves: [],
        }));
      }
    } else {
      if (piece && piece.player === gameState.currentPlayer) {
        const moves = getValidMoves(row, col);
        setGameState(prev => ({
          ...prev,
          selectedPiece: { row, col },
          validMoves: moves,
        }));
      }
    }
  };

  const makeAIMove = useCallback(() => {
    if (!gameState.gameActive) return;
    if (!gameState.players[gameState.currentPlayer].ai) return;

    const pieces: Array<{ row: number; col: number; piece: Piece }> = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.player === gameState.currentPlayer) {
          pieces.push({ row, col, piece });
        }
      }
    }

    if (pieces.length === 0) return;

    let bestMove: { from: Position; to: Position } | null = null;
    let bestScore = -999;

    for (const piecePos of pieces) {
      const moves = getValidMoves(piecePos.row, piecePos.col);

      for (const move of moves) {
        let score = Math.random() * 10;

        if (move.row === 4 && move.col === 4) score += 100;

        const target = gameState.board[move.row][move.col];
        if (target && target.player !== 0) score += 50;

        const distToCenter = Math.abs(move.row - 4) + Math.abs(move.col - 4);
        score -= distToCenter;

        if (score > bestScore) {
          bestScore = score;
          bestMove = { from: piecePos, to: move };
        }
      }
    }

    if (bestMove) {
      setTimeout(() => makeMove(bestMove.from, bestMove.to), gameState.aiSpeed);
    }
  }, [gameState, makeMove]);

  useEffect(() => {
    if (gameState.gameActive && gameState.players[gameState.currentPlayer].ai) {
      makeAIMove();
    }
  }, [gameState.currentPlayer, gameState.gameActive, makeAIMove]);

  const getSquareStyle = (row: number, col: number) => {
    const isCenter = row === 4 && col === 4;
    const isRook = (row === 3 && col === 4) || (row === 5 && col === 4) || 
                   (row === 4 && col === 3) || (row === 4 && col === 5);
    const isSafe = isSafeSquare(row, col);
    const isSelected = gameState.selectedPiece?.row === row && gameState.selectedPiece?.col === col;
    const isValidMove = gameState.validMoves.some(m => m.row === row && m.col === col);

    return [
      styles.square,
      isCenter && styles.centerSquare,
      isRook && styles.rookSquare,
      isSafe && styles.safeSquare,
      isSelected && styles.selectedSquare,
      isValidMove && styles.validMoveSquare,
    ];
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a2e', '#000000']}
        style={styles.background}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>NEO-CHESS</Text>
        <Text style={styles.subtitle}>{numPlayers}-Player Battle</Text>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={initializeGame}>
            <Text style={styles.buttonText}>New Game</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setShowRules(true)}>
            <Text style={styles.buttonText}>Rules</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.playersContainer}>
          {[1, 2, 3, 4].map(p => {
            if (!gameState.players[p].active) return null;
            return (
              <View
                key={p}
                style={[
                  styles.playerCard,
                  { borderColor: PLAYER_COLORS[p as keyof typeof PLAYER_COLORS] },
                  gameState.currentPlayer === p && styles.activePlayer,
                  gameState.players[p].eliminated && styles.eliminatedPlayer,
                ]}
              >
                <Text style={[styles.playerName, { color: PLAYER_COLORS[p as keyof typeof PLAYER_COLORS] }]}>
                  P{p} {gameState.players[p].ai ? '(AI)' : ''}
                </Text>
                <View style={styles.playerStats}>
                  <Text style={styles.statText}>🎯 {gameState.players[p].pieces}</Text>
                  <Text style={styles.statText}>⚔️ {gameState.players[p].captures}</Text>
                  <Text style={styles.statText}>👑 {gameState.players[p].upgrades}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.boardContainer}>
          <View style={styles.board}>
            {gameState.board.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.boardRow}>
                {row.map((piece, colIndex) => (
                  <TouchableOpacity
                    key={`${rowIndex}-${colIndex}`}
                    style={getSquareStyle(rowIndex, colIndex)}
                    onPress={() => handleSquarePress(rowIndex, colIndex)}
                  >
                    {piece && (
                      <Text
                        style={[
                          styles.piece,
                          { color: piece.player === 0 ? '#888' : PLAYER_COLORS[piece.player as keyof typeof PLAYER_COLORS] },
                        ]}
                      >
                        {PIECES[piece.type]}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.turnIndicator, { borderColor: PLAYER_COLORS[gameState.currentPlayer as keyof typeof PLAYER_COLORS] }]}>
          <Text style={styles.turnText}>Current Turn</Text>
          <Text style={[styles.turnPlayer, { color: PLAYER_COLORS[gameState.currentPlayer as keyof typeof PLAYER_COLORS] }]}>
            Player {gameState.currentPlayer}
          </Text>
        </View>
      </ScrollView>

      <Modal visible={showRules} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Neo-Chess Rules</Text>
            <ScrollView>
              <Text style={styles.ruleText}>• Each player starts with 1 Knight and 2 Pawns</Text>
              <Text style={styles.ruleText}>• Knights move 2 squares in any direction</Text>
              <Text style={styles.ruleText}>• Pawns move 1 square in any direction</Text>
              <Text style={styles.ruleText}>• Green squares are safe zones - no captures allowed</Text>
              <Text style={styles.ruleText}>• Reach the golden center to upgrade to Queen!</Text>
              <Text style={styles.ruleText}>• Last player standing wins!</Text>
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowRules(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={winner !== null} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.victoryTitle, { color: winner ? PLAYER_COLORS[winner as keyof typeof PLAYER_COLORS] : '#fff' }]}>
              Player {winner} Wins!
            </Text>
            {winner && (
              <View style={styles.victoryStats}>
                <Text style={styles.victoryText}>Captures: {gameState.players[winner].captures}</Text>
                <Text style={styles.victoryText}>Upgrades: {gameState.players[winner].upgrades}</Text>
                <Text style={styles.victoryText}>Pieces: {gameState.players[winner].pieces}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={initializeGame}>
              <Text style={styles.buttonText}>New Game</Text>
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
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    textShadowColor: '#9333ea',
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#a0a0ff',
    marginTop: 5,
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  button: {
    backgroundColor: '#9333ea',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  playersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
    width: '100%',
  },
  playerCard: {
    width: '48%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
  },
  activePlayer: {
    backgroundColor: 'rgba(147, 51, 234, 0.3)',
  },
  eliminatedPlayer: {
    opacity: 0.3,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  playerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statText: {
    color: '#fff',
    fontSize: 12,
  },
  boardContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  board: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 10,
    padding: 5,
  },
  boardRow: {
    flexDirection: 'row',
  },
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    backgroundColor: '#2a2a3e',
    borderWidth: 1,
    borderColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerSquare: {
    backgroundColor: '#9333ea',
    borderColor: 'gold',
    borderWidth: 2,
  },
  rookSquare: {
    backgroundColor: '#4a4a5e',
  },
  safeSquare: {
    backgroundColor: '#10b981',
  },
  selectedSquare: {
    backgroundColor: 'rgba(147, 51, 234, 0.5)',
    borderColor: '#9333ea',
  },
  validMoveSquare: {
    backgroundColor: 'rgba(34, 197, 94, 0.5)',
    borderColor: '#22c55e',
  },
  piece: {
    fontSize: 30,
  },
  turnIndicator: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 2,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '100%',
  },
  turnText: {
    color: '#fff',
    fontSize: 16,
  },
  turnPlayer: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9333ea',
    marginBottom: 15,
    textAlign: 'center',
  },
  ruleText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#9333ea',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
  },
  victoryTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  victoryStats: {
    marginVertical: 20,
  },
  victoryText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
});