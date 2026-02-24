import { EnemyType, PowerUpType } from './types';

export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.maxLife = Math.random() * 30 + 20;
    this.life = this.maxLife;
    this.color = color;
    this.size = Math.random() * 3 + 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const opacity = this.life / this.maxLife;
    ctx.globalAlpha = opacity;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export class Bullet {
  x: number;
  y: number;
  radius: number = 3;
  speed: number = 8;
  angle: number;
  isPlayer: boolean;

  constructor(x: number, y: number, angle: number = -Math.PI / 2, isPlayer: boolean = true) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.isPlayer = isPlayer;
  }

  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.isPlayer ? '#00f2ff' : '#ff0055';
    ctx.fillStyle = this.isPlayer ? '#00f2ff' : '#ff0055';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  type: EnemyType;
  speed: number;
  hp: number;
  maxHp: number;
  scoreValue: number;
  image: HTMLImageElement | null = null;

  constructor(x: number, y: number, type: EnemyType, level: number, image?: HTMLImageElement | null) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.image = image || null;
    
    switch (type) {
      case EnemyType.FAST:
        this.width = 30;
        this.height = 30;
        this.speed = 4 + level * 0.2;
        this.hp = 1;
        this.scoreValue = 150;
        break;
      case EnemyType.HEAVY:
        this.width = 60;
        this.height = 50;
        this.speed = 1.5 + level * 0.1;
        this.hp = 5 + Math.floor(level / 2);
        this.scoreValue = 500;
        break;
      case EnemyType.BASIC:
      default:
        this.width = 40;
        this.height = 40;
        this.speed = 2.5 + level * 0.15;
        this.hp = 2 + Math.floor(level / 3);
        this.scoreValue = 100;
        break;
    }
    this.maxHp = this.hp;
  }

  update() {
    this.y += this.speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Draw health bar if damaged
    if (this.hp < this.maxHp) {
      ctx.fillStyle = '#333';
      ctx.fillRect(-this.width/2, -this.height/2 - 10, this.width, 4);
      ctx.fillStyle = '#ff0055';
      ctx.fillRect(-this.width/2, -this.height/2 - 10, (this.hp / this.maxHp) * this.width, 4);
    }

    if (this.image && this.image.complete) {
      ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
    } else {
      // Fallback to original drawing
      ctx.shadowBlur = 15;
      switch (this.type) {
        case EnemyType.FAST:
          ctx.shadowColor = '#ffaa00';
          ctx.fillStyle = '#ffaa00';
          ctx.beginPath();
          ctx.moveTo(0, this.height/2);
          ctx.lineTo(-this.width/2, -this.height/2);
          ctx.lineTo(this.width/2, -this.height/2);
          ctx.closePath();
          ctx.fill();
          break;
        case EnemyType.HEAVY:
          ctx.shadowColor = '#ff0055';
          ctx.fillStyle = '#ff0055';
          ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
          ctx.fillStyle = '#990033';
          ctx.fillRect(-this.width/4, -this.height/4, this.width/2, this.height/2);
          break;
        case EnemyType.BASIC:
        default:
          ctx.shadowColor = '#ff3300';
          ctx.fillStyle = '#ff3300';
          ctx.beginPath();
          ctx.moveTo(0, this.height/2);
          ctx.lineTo(-this.width/2, 0);
          ctx.lineTo(0, -this.height/2);
          ctx.lineTo(this.width/2, 0);
          ctx.closePath();
          ctx.fill();
          break;
      }
    }
    ctx.restore();
  }
}

export class PowerUp {
  x: number;
  y: number;
  radius: number = 15;
  type: PowerUpType;
  speed: number = 2;

  constructor(x: number, y: number, type: PowerUpType) {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  update() {
    this.y += this.speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.shadowBlur = 20;
    
    if (this.type === PowerUpType.TRIPLE_SHOT) {
      ctx.shadowColor = '#00ff00';
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 12px Orbitron';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('3X', 0, 0);
    } else {
      ctx.shadowColor = '#0088ff';
      ctx.fillStyle = '#0088ff';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Orbitron';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('S', 0, 0);
    }
    ctx.restore();
  }
}

export class Player {
  x: number;
  y: number;
  width: number = 50;
  height: number = 50;
  speed: number = 5;
  targetX: number;
  targetY: number;
  invincible: number = 0;
  shield: boolean = false;
  tripleShot: number = 0;
  image: HTMLImageElement | null = null;

  constructor(x: number, y: number, image?: HTMLImageElement | null) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.image = image || null;
  }

  update(keys: Set<string>, canvasWidth: number, canvasHeight: number) {
    if (keys.has('ArrowLeft') || keys.has('a')) this.x -= this.speed;
    if (keys.has('ArrowRight') || keys.has('d')) this.x += this.speed;
    if (keys.has('ArrowUp') || keys.has('w')) this.y -= this.speed;
    if (keys.has('ArrowDown') || keys.has('s')) this.y += this.speed;

    // Boundary check
    this.x = Math.max(this.width / 2, Math.min(canvasWidth - this.width / 2, this.x));
    this.y = Math.max(this.height / 2, Math.min(canvasHeight - this.height / 2, this.y));

    if (this.invincible > 0) this.invincible--;
    if (this.tripleShot > 0) this.tripleShot--;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.invincible > 0 && Math.floor(Date.now() / 100) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Draw Shield
    if (this.shield) {
      ctx.beginPath();
      ctx.arc(0, 0, this.width * 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = '#0088ff';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#0088ff';
      ctx.stroke();
    }

    if (this.image && this.image.complete) {
      ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
    } else {
      // Fallback to original drawing
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00f2ff';
      ctx.fillStyle = '#00f2ff';
      
      // Main body
      ctx.beginPath();
      ctx.moveTo(0, -this.height / 2);
      ctx.lineTo(-this.width / 2, this.height / 2);
      ctx.lineTo(0, this.height / 3);
      ctx.lineTo(this.width / 2, this.height / 2);
      ctx.closePath();
      ctx.fill();

      // Cockpit
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, -5, 5, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Thrusters
      const thrusterHeight = 10 + Math.random() * 10;
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(-15, this.height / 3, 10, thrusterHeight);
      ctx.fillRect(5, this.height / 3, 10, thrusterHeight);
    }

    ctx.restore();
  }
}
