import React from 'react';
import { GameState, GameStats, Achievement } from '../types';
import { Play, RotateCcw, Pause, Info, Shield, Zap, Trophy, Heart, Target, ChevronRight, Music, Music2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UIOverlayProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  stats: GameStats;
  achievements: Achievement[];
  isMusicEnabled: boolean;
  setIsMusicEnabled: (enabled: boolean) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  gameState, 
  setGameState, 
  stats, 
  achievements,
  isMusicEnabled,
  setIsMusicEnabled
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col font-display">
      {/* HUD */}
      {gameState === GameState.PLAYING && (
        <div className="p-6 flex justify-between items-start w-full">
          <div className="glass p-4 rounded-2xl flex flex-col gap-2 min-w-[150px]">
            <div className="flex items-center gap-2 text-cyan-400">
              <Target size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">Score</span>
            </div>
            <span className="text-3xl font-black tracking-tighter">{stats.score.toLocaleString()}</span>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: `${(stats.enemiesKilled % 10) * 10}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 pointer-events-auto">
            <div className="flex gap-2">
              <button 
                onClick={() => setGameState(GameState.PAUSED)}
                className="glass p-3 rounded-xl hover:bg-white/20 transition-colors text-white/70"
                title="暂停 (P)"
              >
                <Pause size={20} />
              </button>
              <button 
                onClick={() => setGameState(GameState.START)}
                className="glass p-3 rounded-xl hover:bg-rose-500/20 transition-colors text-rose-400"
                title="退出"
              >
                <RotateCcw size={20} />
              </button>
              <button 
                onClick={() => setIsMusicEnabled(!isMusicEnabled)}
                className="glass p-3 rounded-xl hover:bg-white/20 transition-colors text-white/70"
              >
                {isMusicEnabled ? <Music size={20} className="text-cyan-400" /> : <Music2 size={20} />}
              </button>
            </div>
            <div className="glass p-4 rounded-2xl flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-white/50 uppercase font-bold">Level</span>
                <span className="text-2xl font-black text-emerald-400">{stats.level}</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <Heart 
                    key={i} 
                    size={20} 
                    className={i < stats.lives ? "text-rose-500 fill-rose-500" : "text-white/20"} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screens */}
      <AnimatePresence mode="wait">
        {gameState === GameState.START && (
          <motion.div 
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="m-auto glass-dark p-12 rounded-[2.5rem] flex flex-col items-center text-center max-w-md pointer-events-auto border-cyan-500/30"
          >
            <div className="w-20 h-20 bg-cyan-500/20 rounded-3xl flex items-center justify-center mb-6 neon-border text-cyan-400">
              <Zap size={40} />
            </div>
            <h1 className="text-5xl font-black mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
              MILLIE<span className="text-cyan-400">星际先锋</span>
            </h1>
            <p className="text-white/60 mb-8 leading-relaxed font-sans">
              穿梭于无尽星海，保卫银河系的最后防线。
              升级你的战机，解锁强力武装。
            </p>
            <div className="flex gap-4 mb-8 pointer-events-auto">
              <button 
                onClick={() => setGameState(GameState.PLAYING)}
                className="group relative px-10 py-4 bg-cyan-500 text-black font-black rounded-2xl hover:bg-cyan-400 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
              >
                <Play fill="currentColor" size={20} />
                开始作战
                <div className="absolute inset-0 rounded-2xl bg-cyan-400 blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
              </button>
              <button 
                onClick={() => setIsMusicEnabled(!isMusicEnabled)}
                className={`px-6 py-4 rounded-2xl transition-all flex items-center gap-2 font-bold ${isMusicEnabled ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'glass text-white/50'}`}
              >
                {isMusicEnabled ? <Music size={20} /> : <Music2 size={20} />}
                {isMusicEnabled ? '音乐已启' : '开启音乐'}
              </button>
            </div>
            
            <div className="mt-10 grid grid-cols-2 gap-4 w-full">
              <div className="glass p-3 rounded-xl flex items-center gap-3 text-left">
                <div className="p-2 bg-white/5 rounded-lg"><Info size={16} /></div>
                <span className="text-[10px] font-bold uppercase text-white/40">WASD 移动</span>
              </div>
              <div className="glass p-3 rounded-xl flex items-center gap-3 text-left">
                <div className="p-2 bg-white/5 rounded-lg"><Zap size={16} /></div>
                <span className="text-[10px] font-bold uppercase text-white/40">空格 射击</span>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === GameState.PAUSED && (
          <motion.div 
            key="paused"
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-auto"
          >
            <div className="glass p-10 rounded-[2rem] flex flex-col items-center min-w-[300px]">
              <h2 className="text-4xl font-black mb-8 tracking-tight">作战暂停</h2>
              <div className="flex flex-col gap-4 w-full">
                <button 
                  onClick={() => setGameState(GameState.PLAYING)}
                  className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-colors"
                >
                  <Play size={18} fill="currentColor" /> 继续任务
                </button>
                <button 
                  onClick={() => setGameState(GameState.START)}
                  className="w-full py-4 glass text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
                >
                  <RotateCcw size={18} /> 退出作战
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === GameState.WIN && (
          <motion.div 
            key="win"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="m-auto glass-dark p-12 rounded-[2.5rem] flex flex-col items-center text-center max-w-lg pointer-events-auto border-emerald-500/30"
          >
            <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mb-6 neon-border text-emerald-400">
              <Trophy size={40} />
            </div>
            <div className="text-emerald-500 mb-2 font-black text-sm uppercase tracking-[0.3em]">Mission Accomplished</div>
            <h2 className="text-6xl font-black mb-8 tracking-tighter">星际主宰</h2>
            
            <p className="text-white/60 mb-8 leading-relaxed">
              恭喜！你已成功击退所有敌军，成为了银河系的传奇先锋。
            </p>

            <div className="grid grid-cols-2 gap-4 w-full mb-8">
              <div className="glass p-6 rounded-2xl flex flex-col items-center">
                <span className="text-[10px] text-white/40 uppercase font-bold mb-1">最终得分</span>
                <span className="text-3xl font-black text-cyan-400">{stats.score}</span>
              </div>
              <div className="glass p-6 rounded-2xl flex flex-col items-center">
                <span className="text-[10px] text-white/40 uppercase font-bold mb-1">击落总数</span>
                <span className="text-3xl font-black text-emerald-400">{stats.enemiesKilled}</span>
              </div>
            </div>

            <button 
              onClick={() => setGameState(GameState.START)}
              className="w-full py-5 bg-emerald-500 text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95"
            >
              <RotateCcw size={20} /> 返回主页
            </button>
          </motion.div>
        )}

        {gameState === GameState.GAME_OVER && (
          <motion.div 
            key="gameover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="m-auto glass-dark p-12 rounded-[2.5rem] flex flex-col items-center text-center max-w-lg pointer-events-auto border-rose-500/30"
          >
            <div className="text-rose-500 mb-4 font-black text-sm uppercase tracking-[0.3em]">Mission Failed</div>
            <h2 className="text-6xl font-black mb-8 tracking-tighter">战机坠毁</h2>
            
            <div className="grid grid-cols-2 gap-4 w-full mb-8">
              <div className="glass p-6 rounded-2xl flex flex-col items-center">
                <span className="text-[10px] text-white/40 uppercase font-bold mb-1">最终得分</span>
                <span className="text-3xl font-black text-cyan-400">{stats.score}</span>
              </div>
              <div className="glass p-6 rounded-2xl flex flex-col items-center">
                <span className="text-[10px] text-white/40 uppercase font-bold mb-1">最高关卡</span>
                <span className="text-3xl font-black text-emerald-400">{stats.level}</span>
              </div>
            </div>

            <div className="w-full mb-8 text-left">
              <div className="flex items-center gap-2 mb-4 text-white/40">
                <Trophy size={14} />
                <span className="text-[10px] uppercase font-bold">解锁成就</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {achievements.filter(a => a.unlocked).map(a => (
                  <div key={a.id} className="px-3 py-1.5 glass rounded-lg text-[10px] font-bold text-cyan-300 border-cyan-500/20">
                    {a.title}
                  </div>
                ))}
                {achievements.filter(a => a.unlocked).length === 0 && (
                  <span className="text-xs text-white/20 italic">暂无成就</span>
                )}
              </div>
            </div>

            <button 
              onClick={() => setGameState(GameState.PLAYING)}
              className="w-full py-5 bg-white text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-cyan-400 transition-all hover:scale-105 active:scale-95"
            >
              <RotateCcw size={20} /> 重新出击
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar (Desktop only) */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 w-64 pointer-events-auto">
        <div className="glass p-6 rounded-3xl">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
            <Info size={14} /> 战术装备
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Zap size={20} />
              </div>
              <div>
                <div className="text-xs font-bold mb-1">三向子弹</div>
                <div className="text-[10px] text-white/40 leading-tight">大幅提升火力覆盖范围，持续10秒。</div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <Shield size={20} />
              </div>
              <div>
                <div className="text-xs font-bold mb-1">能量护盾</div>
                <div className="text-[10px] text-white/40 leading-tight">抵挡一次致命伤害并触发短暂无敌。</div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
            <Trophy size={14} /> 实时成就
          </h3>
          <div className="space-y-2">
            {achievements.slice(0, 3).map(a => (
              <div key={a.id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${a.unlocked ? 'bg-cyan-500/10' : 'opacity-30'}`}>
                <div className={`w-2 h-2 rounded-full ${a.unlocked ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-white/20'}`} />
                <span className="text-[10px] font-bold">{a.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
