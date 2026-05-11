import * as THREE from 'three';
import { Player } from './game/Player';
import { Road } from './game/Road';
import { Traffic } from './game/Traffic';
import { Collectibles } from './game/Collectibles';
import { SoundManager } from './game/SoundManager';
import { CONFIG } from './game/Constants';
import '../style.css';

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.scoreVal = document.getElementById('score-val');
    this.coinsVal = document.getElementById('coins-val');
    this.speedVal = document.getElementById('speed-val');
    this.speedNeedle = document.getElementById('speed-needle');
    this.soundToggle = document.getElementById('sound-toggle');
    this.soundIcon = document.getElementById('sound-icon');
    this.mainSoundToggle = document.getElementById('main-sound-toggle');
    this.carOptions = document.querySelectorAll('.car-opt');
    
    this.startBtn = document.getElementById('start-btn');
    this.restartBtn = document.getElementById('restart-btn');
    this.startScreen = document.getElementById('start-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.mobileControls = document.getElementById('mobile-controls');
    this.finalScore = document.getElementById('final-score');
    this.finalCoins = document.getElementById('final-coins');
    this.bestScoreDisplay = document.getElementById('best-score');
    this.bestScoreStart = document.getElementById('best-score-start');

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 20, 300);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMapping = THREE.ReinhardToneMapping;

    this.setupLights();
    
    this.player = new Player(this.scene);
    this.road = new Road(this.scene);
    this.traffic = new Traffic(this.scene);
    this.collectibles = new Collectibles(this.scene);
    this.sounds = new SoundManager();

    this.input = { left: false, right: false, up: false, down: false };
    this.gameSpeed = CONFIG.MOVE_SPEED_START;
    this.baseSpeed = CONFIG.MOVE_SPEED_START;
    this.distance = 0;
    this.coins = 0;
    this.isRacing = false;
    this.isGameOver = false;
    this.currentTheme = 'CITY';

    this.bestScore = localStorage.getItem('turbo_best_score') || 0;
    this.updateBestScoreDisplays();

    this.bindEvents();
    this.bindMobileControls();
    this.animate();
  }

  updateSoundUI(enabled) {
    this.soundIcon.innerText = enabled ? '🔊' : '🔈';
    this.mainSoundToggle.innerText = enabled ? 'ON' : 'OFF';
    if (enabled) {
      this.mainSoundToggle.classList.remove('off');
    } else {
      this.mainSoundToggle.classList.add('off');
    }
  }

  bindMobileControls() {
    const btns = {
      'ctrl-left': 'left',
      'ctrl-right': 'right',
      'ctrl-up': 'up',
      'ctrl-down': 'down'
    };

    Object.entries(btns).forEach(([id, key]) => {
      const el = document.getElementById(id);
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.input[key] = true;
      });
      el.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.input[key] = false;
      });
    });
  }

  updateEnvironment() {
    const themes = Object.keys(CONFIG.THEMES);
    const themeIndex = Math.floor(this.distance / 1000) % themes.length;
    const themeKey = themes[themeIndex];

    if (this.currentTheme !== themeKey) {
      this.currentTheme = themeKey;
      this.road.setTheme(themeKey);
    }

    const targetTheme = CONFIG.THEMES[this.currentTheme];
    const targetColor = new THREE.Color(targetTheme.sky);
    
    this.scene.background.lerp(targetColor, 0.02);
    this.scene.fog.color.lerp(targetColor, 0.02);
  }

  updateBestScoreDisplays() {
    this.bestScoreStart.innerText = Math.floor(this.bestScore);
    this.bestScoreDisplay.innerText = Math.floor(this.bestScore);
  }

  setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(50, 100, 50);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    this.scene.add(sun);

    const hemi = new THREE.HemisphereLight(0x87ceeb, 0x113311, 0.5);
    this.scene.add(hemi);
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') this.input.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') this.input.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w') this.input.up = true;
      if (e.key === 'ArrowDown' || e.key === 's') this.input.down = true;
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a') this.input.left = false;
        if (e.key === 'ArrowRight' || e.key === 'd') this.input.right = false;
        if (e.key === 'ArrowUp' || e.key === 'w') this.input.up = false;
        if (e.key === 'ArrowDown' || e.key === 's') this.input.down = false;
    });

    this.startBtn.addEventListener('click', () => this.startGame());
    this.restartBtn.addEventListener('click', () => this.startGame());
    
    this.carOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        this.carOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        const type = opt.dataset.type;
        this.player.setModel(type);
      });
    });

    const handleToggle = (e) => {
      e.stopPropagation();
      const enabled = this.sounds.toggle();
      this.updateSoundUI(enabled);
    };

    this.soundToggle.addEventListener('click', handleToggle);
    this.mainSoundToggle.addEventListener('click', handleToggle);

    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.camera.aspect = width / height;
      
      // Increase FOV for portrait (mobile) to see more of the sides
      if (width < height) {
        this.camera.fov = 85;
      } else {
        this.camera.fov = 75;
      }
      
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });
  }

  startGame() {
    this.isRacing = true;
    this.isGameOver = false;
    this.distance = 0;
    this.coins = 0;
    this.currentTheme = 'CITY';
    this.gameSpeed = CONFIG.MOVE_SPEED_START;
    this.baseSpeed = CONFIG.MOVE_SPEED_START;
    this.player.reset();
    this.road.reset();
    this.traffic.reset();
    this.collectibles.reset();
    
    this.scene.background.set(CONFIG.THEMES.CITY.sky);
    this.scene.fog.color.set(CONFIG.THEMES.CITY.sky);
    
    this.sounds.startEngine();
    
    this.coinsVal.innerText = '0';
    this.startScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.mobileControls.classList.remove('hidden');
  }

  gameOver() {
    this.isRacing = false;
    this.isGameOver = true;
    
    this.sounds.stopEngine();
    this.sounds.playCrash();

    if (this.distance > this.bestScore) {
      this.bestScore = this.distance;
      localStorage.setItem('turbo_best_score', this.bestScore);
      this.updateBestScoreDisplays();
    }

    this.finalScore.innerText = Math.floor(this.distance);
    this.finalCoins.innerText = this.coins;
    this.gameOverScreen.classList.remove('hidden');
    this.mobileControls.classList.add('hidden');
  }

  update() {
    if (!this.isRacing) return;

    let targetSpeed = this.baseSpeed;
    if (this.input.up) targetSpeed += 0.4;
    if (this.input.down) targetSpeed -= 0.3;
    
    this.gameSpeed += (targetSpeed - this.gameSpeed) * 0.1;
    this.baseSpeed += CONFIG.SPEED_INCREMENT;

    this.player.update(this.input);
    this.road.update(this.gameSpeed);
    this.traffic.update(this.baseSpeed, this.gameSpeed);
    this.collectibles.update(this.gameSpeed);
    this.sounds.updateEngine(this.gameSpeed);
    this.updateEnvironment();

    if (this.traffic.checkCollisions(this.player.mesh.position)) {
      this.gameOver();
    }

    if (this.collectibles.checkCollections(this.player.mesh.position)) {
      this.coins++;
      this.coinsVal.innerText = this.coins;
      this.sounds.playCoin();
      
      this.coinsVal.parentElement.style.transform = 'scale(1.2)';
      setTimeout(() => this.coinsVal.parentElement.style.transform = 'scale(1)', 100);
    }

    this.distance += this.gameSpeed * 0.1;
    this.scoreVal.innerText = Math.floor(this.distance);
    
    const displaySpeed = Math.floor(this.gameSpeed * 100);
    this.speedVal.innerText = displaySpeed;
    
    const rotation = -120 + (Math.min(displaySpeed, 240) / 240) * 240;
    this.speedNeedle.style.transform = `rotate(${rotation}deg)`;

    // Camera follow logic
    const playerX = this.player.mesh.position.x;
    const isMobile = window.innerWidth < 768;
    
    // Adjust camera distance for mobile (narrow screen needs more Z distance to see same width)
    const zBase = isMobile ? 12 : 8;
    const targetCamX = playerX * 0.4;
    const targetCamZ = this.player.mesh.position.z + zBase + (this.gameSpeed * 2.5);
    
    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.05;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.05;
    this.camera.position.y = (isMobile ? 5.5 : 4.5) + (this.gameSpeed * 0.5);
    
    this.camera.lookAt(playerX * 0.5, 1, this.player.mesh.position.z - 15);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.update();
    this.renderer.render(this.scene, this.camera);
  }
}

new Game();
