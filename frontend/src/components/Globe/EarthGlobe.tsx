import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface EarthGlobeProps {
  originLat: number;
  originLon: number;
  antiLat: number;
  antiLon: number;
  isDrilling: boolean;
  onDrillComplete?: () => void;
}

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

function createRealisticEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 4096;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;

  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 2048);
  oceanGrad.addColorStop(0.0, '#040b18');
  oceanGrad.addColorStop(0.15, '#07162c');
  oceanGrad.addColorStop(0.5, '#0b2548');
  oceanGrad.addColorStop(0.85, '#07162c');
  oceanGrad.addColorStop(1.0, '#040b18');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 4096, 2048);

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
  ctx.lineWidth = 1;
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = ((90 - lat) / 180) * 2048;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(4096, y);
    ctx.stroke();
  }
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * 4096;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 2048);
    ctx.stroke();
  }

  function drawLandmass(points: [number, number][], fillColor: string, strokeColor = '#1d4e89') {
    ctx.save();
    ctx.beginPath();
    points.forEach(([lon, lat], i) => {
      const x = ((lon + 180) / 360) * 4096;
      const y = ((90 - lat) / 180) * 2048;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  const northAmerica: [number, number][] = [
    [-168, 65], [-160, 71], [-130, 70], [-95, 70], [-80, 60], [-60, 60], [-55, 50],
    [-65, 44], [-75, 35], [-80, 25], [-82, 23], [-97, 26], [-105, 20], [-88, 16],
    [-77, 8], [-83, 10], [-90, 14], [-105, 23], [-110, 30], [-124, 38], [-125, 48],
    [-135, 57], [-150, 60], [-165, 60], [-168, 65]
  ];
  drawLandmass(northAmerica, '#2d5a27');

  const greenland: [number, number][] = [
    [-55, 60], [-40, 60], [-20, 70], [-20, 80], [-40, 83], [-60, 80], [-55, 60]
  ];
  drawLandmass(greenland, '#e2e8f0', '#94a3b8');

  const southAmerica: [number, number][] = [
    [-77, 8], [-60, 10], [-50, 0], [-35, -5], [-37, -12], [-42, -22], [-50, -30],
    [-55, -40], [-65, -55], [-75, -50], [-72, -38], [-70, -20], [-80, -5], [-77, 8]
  ];
  drawLandmass(southAmerica, '#1b4332');

  const eurasia: [number, number][] = [
    [-10, 36], [0, 43], [5, 52], [10, 58], [25, 71], [40, 68], [60, 70], [80, 73],
    [105, 77], [130, 72], [170, 66], [180, 65], [170, 60], [140, 50], [130, 42],
    [122, 30], [108, 20], [100, 10], [90, 22], [80, 13], [70, 23], [60, 25],
    [50, 30], [42, 40], [35, 32], [28, 41], [15, 38], [5, 36], [-5, 36], [-10, 36]
  ];
  drawLandmass(eurasia, '#386641');

  const scandinavia: [number, number][] = [
    [5, 58], [15, 56], [20, 60], [30, 70], [20, 71], [10, 65], [5, 58]
  ];
  drawLandmass(scandinavia, '#2d6a4f');

  const uk: [number, number][] = [
    [-6, 50], [1, 51], [0, 58], [-5, 58], [-6, 50]
  ];
  drawLandmass(uk, '#2d5a27');

  const africa: [number, number][] = [
    [-6, 36], [10, 37], [32, 31], [34, 28], [43, 12], [51, 11], [40, -5], [35, -20],
    [28, -33], [18, -34], [12, -20], [8, 4], [-12, 5], [-17, 15], [-17, 21], [-6, 36]
  ];
  drawLandmass(africa, '#a68a56', '#b08968');

  const sahara: [number, number][] = [
    [-15, 18], [30, 18], [33, 30], [-5, 33], [-15, 25], [-15, 18]
  ];
  drawLandmass(sahara, '#ddb892', '#cca47c');

  const arabia: [number, number][] = [
    [35, 30], [45, 30], [55, 25], [58, 22], [50, 13], [44, 13], [35, 30]
  ];
  drawLandmass(arabia, '#e6ccb2', '#cca47c');

  const india: [number, number][] = [
    [70, 23], [88, 22], [80, 10], [77, 8], [73, 16], [70, 23]
  ];
  drawLandmass(india, '#2d6a4f');

  const australia: [number, number][] = [
    [114, -22], [120, -15], [135, -12], [142, -11], [153, -28], [150, -37],
    [140, -38], [130, -32], [115, -35], [113, -25], [114, -22]
  ];
  drawLandmass(australia, '#c89f65', '#b08968');

  const japan: [number, number][] = [
    [130, 32], [133, 34], [140, 36], [142, 43], [140, 45], [136, 35], [130, 32]
  ];
  drawLandmass(japan, '#1b4332');

  const antarctica: [number, number][] = [
    [-180, -70], [-120, -72], [-60, -65], [0, -68], [60, -67], [120, -66], [180, -70],
    [180, -90], [-180, -90]
  ];
  drawLandmass(antarctica, '#f8fafc', '#cbd5e1');

  ctx.fillStyle = '#fffae0';
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * 4096;
    const ry = Math.random() * 2048;
    const alpha = Math.random() * 0.7;
    ctx.fillStyle = `rgba(255, 235, 150, ${alpha})`;
    ctx.fillRect(rx, ry, 2, 2);
  }

  return new THREE.CanvasTexture(canvas);
}

function createRealisticCloudsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 2048, 1024);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  for (let i = 0; i < 90; i++) {
    const cx = Math.random() * 2048;
    const cy = 150 + Math.random() * 724;
    const rad = 50 + Math.random() * 120;

    const cloudGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, rad);
    cloudGrad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
    cloudGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
    cloudGrad.addColorStop(0.8, 'rgba(240, 248, 255, 0.15)');
    cloudGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = cloudGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rad * 1.8, rad * 0.7, Math.random() * 0.4 - 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

export const EarthGlobe: React.FC<EarthGlobeProps> = ({
  originLat,
  originLon,
  antiLat,
  antiLon,
  isDrilling,
  onDrillComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const cloudsMeshRef = useRef<THREE.Mesh | null>(null);
  const laserRef = useRef<THREE.Line | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 310);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xdbeafe, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
    sunLight.position.set(250, 120, 180);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    fillLight.position.set(-200, -80, -100);
    scene.add(fillLight);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const earthTexture = createRealisticEarthTexture();
    earthTexture.anisotropy = 8;
    const earthGeometry = new THREE.SphereGeometry(100, 128, 128);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.65,
      metalness: 0.15,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);

    const cloudsTexture = createRealisticCloudsTexture();
    const cloudsGeometry = new THREE.SphereGeometry(101.4, 64, 64);
    const cloudsMaterial = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.NormalBlending,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    globeGroup.add(cloudsMesh);
    cloudsMeshRef.current = cloudsMesh;

    const atmosphereVertexShader = `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const atmosphereFragmentShader = `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
        gl_FragColor = vec4(0.22, 0.74, 0.97, 1.0) * intensity;
      }
    `;

    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });

    const atmosphereMesh = new THREE.Mesh(new THREE.SphereGeometry(112, 64, 64), atmosphereMaterial);
    globeGroup.add(atmosphereMesh);

    const starsGeo = new THREE.BufferGeometry();
    const starCount = 1200;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 1000;
      starPos[i + 1] = (Math.random() - 0.5) * 1000;
      starPos[i + 2] = (Math.random() - 0.5) * 1000;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.6,
      transparent: true,
      opacity: 0.8,
    });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isDraggingRef.current && !isDrilling) {
        globeGroup.rotation.y += 0.0012;
      }

      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += 0.0004;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      camera.position.z = Math.min(Math.max(camera.position.z + e.deltaY * 0.15, 140), 500);
    };

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('wheel', handleWheel);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current && dom) {
        containerRef.current.removeChild(dom);
      }
    };
  }, []);

  useEffect(() => {
    if (!globeGroupRef.current) return;

    if (laserRef.current) {
      globeGroupRef.current.remove(laserRef.current);
      laserRef.current.geometry.dispose();
    }

    const originVec = latLonToVector3(originLat, originLon, 102.5);
    const antiVec = latLonToVector3(antiLat, antiLon, 102.5);

    const laserPoints = [originVec, new THREE.Vector3(0, 0, 0), antiVec];
    const laserGeo = new THREE.BufferGeometry().setFromPoints(laserPoints);
    const laserMat = new THREE.LineBasicMaterial({
      color: 0xf43f5e,
      linewidth: 4,
      transparent: true,
      opacity: 0.95,
    });
    const laser = new THREE.Line(laserGeo, laserMat);
    globeGroupRef.current.add(laser);
    laserRef.current = laser;

    const pinGeo = new THREE.SphereGeometry(2.8, 16, 16);
    const originPinMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const antiPinMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });

    const originPin = new THREE.Mesh(pinGeo, originPinMat);
    originPin.position.copy(originVec);
    globeGroupRef.current.add(originPin);

    const antiPin = new THREE.Mesh(pinGeo, antiPinMat);
    antiPin.position.copy(antiVec);
    globeGroupRef.current.add(antiPin);

    return () => {
      if (globeGroupRef.current) {
        globeGroupRef.current.remove(originPin);
        globeGroupRef.current.remove(antiPin);
      }
      pinGeo.dispose();
      originPinMat.dispose();
      antiPinMat.dispose();
    };
  }, [originLat, originLon, antiLat, antiLon]);

  useEffect(() => {
    if (!isDrilling || !cameraRef.current || !globeGroupRef.current) return;

    let progress = 0;
    const startZ = cameraRef.current.position.z;
    const targetZ = 120;

    const drillInterval = setInterval(() => {
      progress += 0.035;
      if (progress <= 1) {
        cameraRef.current!.position.z = THREE.MathUtils.lerp(startZ, targetZ, progress);
        globeGroupRef.current!.rotation.y += 0.09;
      } else if (progress <= 2) {
        const subP = progress - 1;
        cameraRef.current!.position.z = THREE.MathUtils.lerp(targetZ, startZ, subP);
        globeGroupRef.current!.rotation.y += 0.045;
      } else {
        clearInterval(drillInterval);
        if (onDrillComplete) onDrillComplete();
      }
    }, 25);

    return () => clearInterval(drillInterval);
  }, [isDrilling, onDrillComplete]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
    />
  );
};
