import * as THREE from 'three';
import { CONFIG } from './Constants';

export class Road {
  constructor(scene) {
    this.scene = scene;
    this.segments = [];
    this.segmentLength = 500;
    this.currentTheme = 'CITY';
    
    // Create two segments for infinite loop
    this.segments.push(this.createSegment(0));
    this.segments.push(this.createSegment(-this.segmentLength));
    
    this.segments.forEach(s => this.scene.add(s));
  }

  createSegment(zOffset) {
    const group = new THREE.Group();
    const theme = CONFIG.THEMES[this.currentTheme];

    // Asphalt
    const roadGeom = new THREE.PlaneGeometry(CONFIG.LANE_WIDTH * CONFIG.TOTAL_LANES + 4, this.segmentLength);
    const roadMat = new THREE.MeshPhongMaterial({ color: CONFIG.COLORS.ROAD });
    const road = new THREE.Mesh(roadGeom, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    group.add(road);

    // Grass/Sides
    const sideGeom = new THREE.PlaneGeometry(100, this.segmentLength);
    const sideMat = new THREE.MeshPhongMaterial({ color: theme.ground });
    
    const leftSide = new THREE.Mesh(sideGeom, sideMat);
    leftSide.rotation.x = -Math.PI / 2;
    leftSide.position.x = -30;
    leftSide.position.y = -0.1;
    group.add(leftSide);

    const rightSide = new THREE.Mesh(sideGeom, sideMat);
    rightSide.rotation.x = -Math.PI / 2;
    rightSide.position.x = 30;
    rightSide.position.y = -0.1;
    group.add(rightSide);

    // Lane Markings
    const markingGeom = new THREE.PlaneGeometry(0.2, 5);
    const markingMat = new THREE.MeshBasicMaterial({ color: CONFIG.COLORS.LANE });

    for (let i = 0; i < this.segmentLength / 10; i++) {
      [-CONFIG.LANE_WIDTH / 2, CONFIG.LANE_WIDTH / 2].forEach(x => {
        const line = new THREE.Mesh(markingGeom, markingMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(x, 0.01, (i * 10) - (this.segmentLength / 2));
        group.add(line);
      });
    }

    // Buildings
    const bMat = new THREE.MeshPhongMaterial({ color: theme.buildings });
    for (let i = 0; i < 20; i++) {
        const h = 5 + Math.random() * 15;
        const bGeom = new THREE.BoxGeometry(5, h, 5);
        const b = new THREE.Mesh(bGeom, bMat);
        const side = Math.random() > 0.5 ? 1 : -1;
        b.position.set(side * (12 + Math.random() * 20), h/2, (Math.random() - 0.5) * this.segmentLength);
        group.add(b);
    }

    group.position.z = zOffset;
    group.userData.theme = this.currentTheme;
    return group;
  }

  update(speed) {
    this.segments.forEach((seg, index) => {
      seg.position.z += speed;
      
      if (seg.position.z > 250) {
        // Recycle segment
        seg.position.z -= this.segmentLength * 2;
        
        // Update theme if it changed
        if (seg.userData.theme !== this.currentTheme) {
            this.scene.remove(seg);
            const newSeg = this.createSegment(seg.position.z);
            this.segments[index] = newSeg;
            this.scene.add(newSeg);
        }
      }
    });
  }

  setTheme(themeKey) {
    this.currentTheme = themeKey;
  }

  reset() {
    this.currentTheme = 'CITY';
    this.segments.forEach(s => this.scene.remove(s));
    this.segments = [];
    this.segments.push(this.createSegment(0));
    this.segments.push(this.createSegment(-this.segmentLength));
    this.segments.forEach(s => this.scene.add(s));
  }
}
