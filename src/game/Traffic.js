import * as THREE from 'three';
import { CONFIG } from './Constants';

export class Traffic {
  constructor(scene) {
    this.scene = scene;
    this.cars = [];
    this.carPoolSize = 10;
    this.lastSpawnZ = 0;
    
    for (let i = 0; i < this.carPoolSize; i++) {
        const car = this.createNPCCar();
        car.visible = false;
        car.userData.active = false;
        this.cars.push(car);
        this.scene.add(car);
    }
  }

  createNPCCar() {
    const group = new THREE.Group();
    const color = CONFIG.COLORS.TRAFFIC[Math.floor(Math.random() * CONFIG.COLORS.TRAFFIC.length)];

    // Body
    const bodyGeom = new THREE.BoxGeometry(1.8, 0.8, 4);
    const bodyMat = new THREE.MeshPhongMaterial({ color: color });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    group.add(body);

    // Cabin
    const cabinGeom = new THREE.BoxGeometry(1.6, 0.6, 1.8);
    const cabinMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
    const cabin = new THREE.Mesh(cabinGeom, cabinMat);
    cabin.position.set(0, 0.6, 0);
    group.add(cabin);

    return group;
  }

  spawn(speed) {
    const spawnZ = -250;
    
    // Find an inactive car
    const car = this.cars.find(c => !c.userData.active);
    if (car) {
        const lane = Math.floor(Math.random() * 3) - 1;
        
        // Prevent overlapping spawns
        const tooClose = this.cars.some(c => c.userData.active && c.userData.lane === lane && Math.abs(c.position.z - spawnZ) < 20);
        
        if (!tooClose) {
            car.position.set(lane * CONFIG.LANE_WIDTH, 0.4, spawnZ);
            car.visible = true;
            car.userData.active = true;
            car.userData.lane = lane;
            car.userData.speed = 0.2 + Math.random() * 0.3; // Give NPC some individual speed
            
            // Randomize color
            car.children[0].material.color.set(CONFIG.COLORS.TRAFFIC[Math.floor(Math.random() * CONFIG.COLORS.TRAFFIC.length)]);
        }
    }
  }

  update(baseSpeed, gameSpeed) {
    this.cars.forEach(car => {
      if (car.userData.active) {
        // NPCs move relative to the road speed
        car.position.z += gameSpeed - car.userData.speed;
        
        if (car.position.z > 50) {
          car.userData.active = false;
          car.visible = false;
        }
      }
    });

    if (Math.random() < 0.02) {
        this.spawn(gameSpeed);
    }
  }

  reset() {
    this.cars.forEach(car => {
      car.userData.active = false;
      car.visible = false;
    });
  }

  checkCollisions(playerPos) {
    const PW = 1.4; // Slightly smaller than visual for fairer gameplay
    const PD = 3.5;

    for (const car of this.cars) {
      if (car.userData.active) {
        const CX = car.position.x;
        const CZ = car.position.z;
        const CW = 1.4;
        const CD = 3.5;

        if (Math.abs(playerPos.x - CX) < (PW + CW) / 2 && Math.abs(playerPos.z - CZ) < (PD + CD) / 2) {
          return true;
        }
      }
    }
    return false;
  }
}
