import * as THREE from 'three';
import { CONFIG } from './Constants';

export class Collectibles {
  constructor(scene) {
    this.scene = scene;
    this.coins = [];
    this.poolSize = 10;
    
    for (let i = 0; i < this.poolSize; i++) {
        const coin = this.createCoin();
        coin.visible = false;
        coin.userData.active = false;
        this.coins.push(coin);
        this.scene.add(coin);
    }
  }

  createCoin() {
    const group = new THREE.Group();
    
    const geom = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
    const mat = new THREE.MeshPhongMaterial({ 
        color: CONFIG.COLORS.COIN, 
        emissive: 0xaa8800,
        shininess: 100 
    });
    const coin = new THREE.Mesh(geom, mat);
    coin.rotation.x = Math.PI / 2;
    group.add(coin);

    return group;
  }

  spawn() {
    const coin = this.coins.find(c => !c.userData.active);
    if (coin) {
        const lane = Math.floor(Math.random() * 3) - 1;
        coin.position.set(lane * CONFIG.LANE_WIDTH, 0.5, -200);
        coin.visible = true;
        coin.userData.active = true;
    }
  }

  update(gameSpeed) {
    this.coins.forEach(coin => {
      if (coin.userData.active) {
        coin.position.z += gameSpeed;
        coin.rotation.y += 0.05; // Spin effect
        
        if (coin.position.z > 50) {
          coin.userData.active = false;
          coin.visible = false;
        }
      }
    });

    if (Math.random() < CONFIG.COIN_SPAWN_CHANCE) {
      this.spawn();
    }
  }

  checkCollections(playerPos) {
    for (const coin of this.coins) {
      if (coin.userData.active) {
        const dist = coin.position.distanceTo(playerPos);
        if (dist < 1.5) {
          coin.userData.active = false;
          coin.visible = false;
          return true;
        }
      }
    }
    return false;
  }

  reset() {
    this.coins.forEach(coin => {
      coin.userData.active = false;
      coin.visible = false;
    });
  }
}
