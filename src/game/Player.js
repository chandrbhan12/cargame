import * as THREE from 'three';
import { CONFIG } from './Constants';

export class Player {
  constructor(scene) {
    this.scene = scene;
    this.currentModel = 'SPORT';
    this.mesh = this.createCar('SPORT');
    this.scene.add(this.mesh);
    
    this.targetLane = 0;
    this.currentLane = 0;
    this.speedX = 0.15;
    
    this.mesh.position.set(0, 0.4, CONFIG.PLAYER_Z);
  }

  setModel(type) {
    this.scene.remove(this.mesh);
    this.currentModel = type;
    this.mesh = this.createCar(type);
    this.scene.add(this.mesh);
    this.mesh.position.set(this.targetLane * CONFIG.LANE_WIDTH, 0.4, CONFIG.PLAYER_Z);
  }

  createCar(type) {
    const group = new THREE.Group();
    const config = CONFIG.CAR_MODELS[type];
    const carColor = config.color;

    let bodyGeom, cabinGeom, cabinPos, spoiler = false, wheelY = -0.2, high = false;

    switch(type) {
        case 'SPORT': // BMW style
            bodyGeom = new THREE.BoxGeometry(1.8, 0.7, 4.2);
            cabinGeom = new THREE.BoxGeometry(1.6, 0.6, 2.2);
            cabinPos = [0, 0.6, -0.2];
            spoiler = true;
            break;
        case 'SUPER': // Audi style
            bodyGeom = new THREE.BoxGeometry(2.1, 0.6, 4.5);
            cabinGeom = new THREE.BoxGeometry(1.7, 0.5, 2);
            cabinPos = [0, 0.5, 0];
            spoiler = true;
            break;
        case 'OFFROAD': // Thar style
            bodyGeom = new THREE.BoxGeometry(1.9, 1.2, 3.8);
            cabinGeom = new THREE.BoxGeometry(1.8, 0.8, 2);
            cabinPos = [0, 1.0, -0.5];
            wheelY = -0.5;
            high = true;
            break;
        case 'HYPER': // Futuristic
            bodyGeom = new THREE.BoxGeometry(2, 0.5, 5);
            cabinGeom = new THREE.BoxGeometry(1.5, 0.5, 2.5);
            cabinPos = [0, 0.4, 0.5];
            spoiler = true;
            break;
        default: // Classic
            bodyGeom = new THREE.BoxGeometry(1.8, 0.8, 4);
            cabinGeom = new THREE.BoxGeometry(1.6, 0.6, 2);
            cabinPos = [0, 0.6, -0.2];
    }

    // Body
    const bodyMat = new THREE.MeshPhongMaterial({ color: carColor, shininess: 100 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.castShadow = true;
    group.add(body);

    // Cabin
    const cabinMat = new THREE.MeshPhongMaterial({ color: 0x111111, shininess: 150 });
    const cabin = new THREE.Mesh(cabinGeom, cabinMat);
    cabin.position.set(...cabinPos);
    group.add(cabin);

    // Spoiler
    if (spoiler) {
        const sGeom = new THREE.BoxGeometry(type === 'SUPER' ? 2.1 : 1.8, 0.1, 0.4);
        const s = new THREE.Mesh(sGeom, bodyMat);
        s.position.set(0, high ? 1.3 : 0.8, -1.8);
        group.add(s);
    }

    // Wheels
    const wheelGeom = new THREE.CylinderGeometry(high ? 0.6 : 0.4, high ? 0.6 : 0.4, 0.4, 16);
    const wheelMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
    const wheelPositions = [[-1, wheelY, 1.2], [1, wheelY, 1.2], [-1, wheelY, -1.2], [1, wheelY, -1.2]];
    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeom, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(...pos);
      group.add(wheel);
    });

    // Lights
    const lightGeom = new THREE.BoxGeometry(0.5, 0.2, 0.1);
    const headLightMat = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2 });
    const tailLightMat = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 2 });

    const fl = new THREE.Mesh(lightGeom, headLightMat);
    fl.position.set(-0.6, 0, type === 'HYPER' ? 2.5 : 2);
    group.add(fl);
    const fr = new THREE.Mesh(lightGeom, headLightMat);
    fr.position.set(0.6, 0, type === 'HYPER' ? 2.5 : 2);
    group.add(fr);

    return group;
  }

  update(input) {
    if (input.left && this.targetLane > -1) {
      this.targetLane -= 1;
      input.left = false;
    }
    if (input.right && this.targetLane < 1) {
      this.targetLane += 1;
      input.right = false;
    }

    const targetX = this.targetLane * CONFIG.LANE_WIDTH;
    this.mesh.position.x += (targetX - this.mesh.position.x) * 0.15;
    
    this.mesh.rotation.y = (targetX - this.mesh.position.x) * -0.1;
    this.mesh.rotation.z = (targetX - this.mesh.position.x) * -0.05;
  }

  reset() {
    this.targetLane = 0;
    this.mesh.position.x = 0;
    this.mesh.rotation.set(0, 0, 0);
  }
}
