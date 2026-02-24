import React, { useEffect, useRef, useState } from 'react';
import { GameState, EnemyType, PowerUpType, GameStats, Achievement } from '../types';
import { Player, Enemy, Bullet, PowerUp, Particle } from '../Entities';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  stats: GameStats;
  setStats: React.Dispatch<React.SetStateAction<GameStats>>;
  onAchievement: (achievement: Achievement) => void;
  onLevelUp: (level: number) => void;
  onEscaped: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  setGameState,
  stats,
  setStats,
  onAchievement,
  onLevelUp,
  onEscaped
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(null);
  
  // Game entities
  const playerRef = useRef<Player | null>(null);
  const enemiesRef = useRef<Enemy[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<{x: number, y: number, size: number, speed: number, opacity: number}[]>([]);
  const nebulaeRef = useRef<{x: number, y: number, radius: number, color: string}[]>([]);
  
  const keysRef = useRef<Set<string>>(new Set());
  const lastShotRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const levelUpPendingRef = useRef<boolean>(false);
  
  // Image assets
  const playerImageRef = useRef<HTMLImageElement | null>(null);
  const enemyImageRef = useRef<HTMLImageElement | null>(null);

  // Load images
  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL;
    const pImg = new Image();
    pImg.src = `${baseUrl}player.png`;
    pImg.onload = () => { 
      console.log('Player image loaded successfully');
      playerImageRef.current = pImg; 
      if (playerRef.current) playerRef.current.image = pImg;
    };
    
    const eImg = new Image();
    eImg.src = `${baseUrl}enemy.png`;
    eImg.onload = () => { 
      console.log('Enemy image loaded successfully');
      enemyImageRef.current = eImg; 
      enemiesRef.current.forEach(e => e.image = eImg);
    };
  }, []);

  // Initialize stars and nebulae
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2,
        speed: Math.random() * 1.5 + 0.2,
        opacity: Math.random() * 0.8 + 0.2
      });
    }
    starsRef.current = stars;

    const nebulae = [];
    const colors = ['rgba(64, 0, 128, 0.1)', 'rgba(0, 64, 128, 0.1)', 'rgba(128, 0, 64, 0.1)'];
    for (let i = 0; i < 5; i++) {
      nebulae.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 400 + 200,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    nebulaeRef.current = nebulae;
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (e.key === 'p' || e.key === 'P') {
        if (gameState === GameState.PLAYING) setGameState(GameState.PAUSED);
        else if (gameState === GameState.PAUSED) setGameState(GameState.PLAYING);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, setGameState]);

  // Touch controls
  const handleTouch = (e: React.TouchEvent) => {
    if (gameState !== GameState.PLAYING || !playerRef.current) return;
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      playerRef.current.x = touch.clientX - rect.left;
      playerRef.current.y = touch.clientY - rect.top - 50; // Offset for visibility
    }
  };

  const spawnEnemy = (canvas: HTMLCanvasElement) => {
    const types = [EnemyType.BASIC, EnemyType.FAST, EnemyType.HEAVY];
    const rand = Math.random();
    let type = EnemyType.BASIC;
    if (rand > 0.85) type = EnemyType.HEAVY;
    else if (rand > 0.6) type = EnemyType.FAST;

    const x = Math.random() * (canvas.width - 100) + 50;
    enemiesRef.current.push(new Enemy(x, -50, type, stats.level, enemyImageRef.current));
  };

  const spawnPowerUp = (x: number, y: number) => {
    const type = Math.random() > 0.5 ? PowerUpType.TRIPLE_SHOT : PowerUpType.SHIELD;
    powerUpsRef.current.push(new PowerUp(x, y, type));
  };

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 15; i++) {
      particlesRef.current.push(new Particle(x, y, color));
    }
  };

  const resetGame = () => {
    if (!canvasRef.current) return;
    playerRef.current = new Player(canvasRef.current.width / 2, canvasRef.current.height - 100, playerImageRef.current);
    enemiesRef.current = [];
    bulletsRef.current = [];
    powerUpsRef.current = [];
    particlesRef.current = [];
    setStats({
      score: 0,
      level: 1,
      lives: 3,
      enemiesKilled: 0,
      powerUpsCollected: 0,
      distanceTraveled: 0
    });
  };

  useEffect(() => {
    if (gameState === GameState.PLAYING && !playerRef.current) {
      resetGame();
    }
  }, [gameState]);

  const update = () => {
    if (gameState !== GameState.PLAYING || !canvasRef.current || !playerRef.current) return;

    const canvas = canvasRef.current;
    const player = playerRef.current;

    // Update Stars
    starsRef.current.forEach(star => {
      star.y += star.speed;
      if (star.y > canvas.height) star.y = 0;
    });

    // Update Player
    player.update(keysRef.current, canvas.width, canvas.height);

    // Shooting
    const now = Date.now();
    if (keysRef.current.has(' ') && now - lastShotRef.current > 200) {
      if (player.tripleShot > 0) {
        bulletsRef.current.push(new Bullet(player.x, player.y - 20, -Math.PI / 2));
        bulletsRef.current.push(new Bullet(player.x - 15, player.y - 10, -Math.PI / 2 - 0.2));
        bulletsRef.current.push(new Bullet(player.x + 15, player.y - 10, -Math.PI / 2 + 0.2));
      } else {
        bulletsRef.current.push(new Bullet(player.x, player.y - 20));
      }
      lastShotRef.current = now;
    }

    // Update Bullets
    bulletsRef.current.forEach((bullet, bIndex) => {
      bullet.update();
      if (bullet.y < 0 || bullet.y > canvas.height || bullet.x < 0 || bullet.x > canvas.width) {
        bulletsRef.current.splice(bIndex, 1);
      }
    });

    // Update Enemies
    enemiesRef.current.forEach((enemy, eIndex) => {
      enemy.update();
      
      // Check collision with player
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (dist < (player.width + enemy.width) / 2.5 && player.invincible === 0) {
        if (player.shield) {
          player.shield = false;
          player.invincible = 60;
          createExplosion(enemy.x, enemy.y, '#ff0055');
          enemiesRef.current.splice(eIndex, 1);
        } else {
          setStats(prev => ({ ...prev, lives: prev.lives - 1 }));
          player.invincible = 120;
          createExplosion(player.x, player.y, '#00f2ff');
          if (stats.lives <= 1) {
            setGameState(GameState.GAME_OVER);
          }
        }
      }

      // Check escaped
      if (enemy.y > canvas.height) {
        enemiesRef.current.splice(eIndex, 1);
        setStats(prev => ({ ...prev, score: Math.max(0, prev.score - 50) }));
        onEscaped();
      }
    });

    // Bullet-Enemy Collision
    bulletsRef.current.forEach((bullet, bIndex) => {
      if (!bullet.isPlayer) return;
      enemiesRef.current.forEach((enemy, eIndex) => {
        const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
        if (dist < (bullet.radius + enemy.width / 2)) {
          enemy.hp--;
          bulletsRef.current.splice(bIndex, 1);
          
          if (enemy.hp <= 0) {
            createExplosion(enemy.x, enemy.y, enemy.type === EnemyType.HEAVY ? '#ff0055' : '#ffaa00');
            setStats(prev => {
              const newKills = prev.enemiesKilled + 1;
              const newScore = prev.score + enemy.scoreValue;
              
              // Level up logic based on score
              const levelThresholds = [100, 300, 800, 1000, 5000];
              const currentThreshold = levelThresholds[prev.level - 1];

              if (newScore >= currentThreshold) {
                if (prev.level === 5) {
                  setGameState(GameState.WIN);
                } else {
                  levelUpPendingRef.current = true;
                }
              }

              // Achievement logic
              if (newKills === 1) onAchievement({ id: 'first_blood', title: '第一滴血', description: '击落第一架敌机', unlocked: true });
              if (newKills === 50) onAchievement({ id: 'ace', title: '王牌飞行员', description: '击落50架敌机', unlocked: true });
              
              return { ...prev, score: newScore, enemiesKilled: newKills };
            });

            // Random powerup spawn
            if (Math.random() > 0.9) {
              spawnPowerUp(enemy.x, enemy.y);
            }
            enemiesRef.current.splice(eIndex, 1);
          }
        }
      });
    });

    // Level up handling
    if (levelUpPendingRef.current) {
      levelUpPendingRef.current = false;
      setStats(prev => ({ ...prev, level: prev.level + 1 }));
      onLevelUp(stats.level + 1);
      enemiesRef.current = []; // Clear screen
      onAchievement({ id: `level_${stats.level + 1}`, title: `星际进阶`, description: `达到第 ${stats.level + 1} 关`, unlocked: true });
    }

    // Update PowerUps
    powerUpsRef.current.forEach((pu, index) => {
      pu.update();
      const dist = Math.hypot(player.x - pu.x, player.y - pu.y);
      if (dist < (player.width / 2 + pu.radius)) {
        if (pu.type === PowerUpType.TRIPLE_SHOT) player.tripleShot = 600; // 10 seconds at 60fps
        else player.shield = true;
        
        setStats(prev => ({ ...prev, powerUpsCollected: prev.powerUpsCollected + 1 }));
        powerUpsRef.current.splice(index, 1);
        onAchievement({ id: 'collector', title: '资源采集者', description: '拾取一个道具', unlocked: true });
      }
      if (pu.y > canvas.height) powerUpsRef.current.splice(index, 1);
    });

    // Update Particles
    particlesRef.current.forEach((p, index) => {
      p.update();
      if (p.life <= 0) particlesRef.current.splice(index, 1);
    });

    // Enemy Spawning
    spawnTimerRef.current++;
    const spawnRate = Math.max(20, 60 - stats.level * 2);
    if (spawnTimerRef.current > spawnRate) {
      spawnEnemy(canvas);
      spawnTimerRef.current = 0;
    }
  };

  const draw = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw Stars and Nebulae
    nebulaeRef.current.forEach(nebula => {
      const gradient = ctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.radius);
      gradient.addColorStop(0, nebula.color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    });

    starsRef.current.forEach(star => {
      ctx.globalAlpha = star.opacity;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw Entities
    particlesRef.current.forEach(p => p.draw(ctx));
    powerUpsRef.current.forEach(pu => pu.draw(ctx));
    bulletsRef.current.forEach(b => b.draw(ctx));
    enemiesRef.current.forEach(e => e.draw(ctx));
    if (playerRef.current) playerRef.current.draw(ctx);
  };

  const loop = () => {
    update();
    draw();
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, stats.level]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-none"
        onTouchMove={handleTouch}
        onTouchStart={handleTouch}
      />
    </div>
  );
};

export default GameCanvas;
