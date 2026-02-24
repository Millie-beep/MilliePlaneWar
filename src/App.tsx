import { useState, useEffect, useCallback } from 'react';
import { GameState, GameStats, Achievement } from './types';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Zap, AlertCircle } from 'lucide-react';

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_blood', title: '第一滴血', description: '击落第一架敌机', unlocked: false },
  { id: 'survivor', title: '生存者', description: '在第一关存活超过30秒', unlocked: false },
  { id: 'collector', title: '资源采集者', description: '拾取一个道具', unlocked: false },
  { id: 'ace', title: '王牌飞行员', description: '击落50架敌机', unlocked: false },
  { id: 'level_5', title: '星际老兵', description: '达到第5关', unlocked: false },
];

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    level: 1,
    lives: 3,
    enemiesKilled: 0,
    powerUpsCollected: 0,
    distanceTraveled: 0
  });
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [notifications, setNotifications] = useState<{id: string, title: string, type: 'achievement' | 'level' | 'warning'}[]>([]);
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);

  // Background music control
  useEffect(() => {
    const audio = document.getElementById('bg-music') as HTMLAudioElement;
    if (audio) {
      if (isMusicEnabled && (gameState === GameState.PLAYING || gameState === GameState.PAUSED)) {
        audio.play().catch(e => console.log('Audio play blocked:', e));
      } else {
        audio.pause();
      }
    }
  }, [isMusicEnabled, gameState]);

  const addNotification = useCallback((title: string, type: 'achievement' | 'level' | 'warning') => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [...prev, { id, title, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  const handleAchievement = useCallback((achievement: Achievement) => {
    setAchievements(prev => {
      const existing = prev.find(a => a.id === achievement.id);
      if (existing && !existing.unlocked) {
        addNotification(`成就达成: ${achievement.title}`, 'achievement');
        return prev.map(a => a.id === achievement.id ? { ...a, unlocked: true } : a);
      }
      return prev;
    });
  }, [addNotification]);

  const handleLevelUp = useCallback((level: number) => {
    addNotification(`关卡升级: LEVEL ${level}`, 'level');
  }, [addNotification]);

  const handleEscaped = useCallback(() => {
    // Only show warning occasionally to avoid spam
    if (Math.random() > 0.7) {
      addNotification('敌机逃脱: 扣除50分', 'warning');
    }
  }, [addNotification]);

  // Survival achievement check
  useEffect(() => {
    let timer: number;
    if (gameState === GameState.PLAYING && stats.level === 1) {
      timer = window.setTimeout(() => {
        handleAchievement(INITIAL_ACHIEVEMENTS[1]);
      }, 30000);
    }
    return () => clearTimeout(timer);
  }, [gameState, stats.level, handleAchievement]);

  return (
    <div className="w-screen h-screen bg-black text-white selection:bg-cyan-500/30">
      <GameCanvas 
        gameState={gameState} 
        setGameState={setGameState}
        stats={stats}
        setStats={setStats}
        onAchievement={handleAchievement}
        onLevelUp={handleLevelUp}
        onEscaped={handleEscaped}
      />
      
      <UIOverlay 
        gameState={gameState} 
        setGameState={setGameState} 
        stats={stats}
        achievements={achievements}
        isMusicEnabled={isMusicEnabled}
        setIsMusicEnabled={setIsMusicEnabled}
      />

      {/* Background Music */}
      <audio 
        id="bg-music" 
        loop 
        src="/bgm.mp3" 
      />

      {/* Notifications */}
      <div className="fixed bottom-6 left-6 flex flex-col gap-3 pointer-events-none z-50">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.9 }}
              className={`glass px-6 py-4 rounded-2xl flex items-center gap-4 border-l-4 ${
                n.type === 'achievement' ? 'border-l-cyan-400' : 
                n.type === 'level' ? 'border-l-emerald-400' : 'border-l-rose-500'
              }`}
            >
              <div className={`p-2 rounded-xl ${
                n.type === 'achievement' ? 'bg-cyan-500/20 text-cyan-400' : 
                n.type === 'level' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-500'
              }`}>
                {n.type === 'achievement' ? <Trophy size={20} /> : 
                 n.type === 'level' ? <Zap size={20} /> : <AlertCircle size={20} />}
              </div>
              <span className="font-display font-bold text-sm tracking-tight">{n.title}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
