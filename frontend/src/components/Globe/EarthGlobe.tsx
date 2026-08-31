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

function createProceduralEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
  gradient.addColorStop(0, '#0c1a30');
  gradient.addColorStop(0.3, '#0f2b48');
  gradient.addColorStop(0.5, '#0a3d62');
  gradient.addColorStop(0.7, '#0f2b48');
  gradient.addColorStop(1, '#0c1a30');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2048, 1024);

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.lineWidth = 1;
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = ((90 - lat) / 180) * 1024;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
    ctx.stroke();
  }
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * 2048;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }

  const continents = [
    { x: 1000, y: 350, r: 240 },
    { x: 1250, y: 380, r: 320 },
    { x: 1050, y: 650, r: 220 },
    { x: 450, y: 350, r: 260 },
    { x: 600, y: 700, r: 220 },
    { x: 1550, y: 750, r: 180 },
  ];

  continents.forEach((c) => {
    const landGrad = ctx.createRadialGradient(c.x, c.y, 20, c.x, c.y, c.r);
    landGrad.addColorStop(0, '#10b981');
    landGrad.addColorStop(0.5, '#059669');
    landGrad.addColorStop(0.85, '#047857');
    landGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = landGrad;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  });

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
  const laserRef = useRef<THREE.Line | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 320);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    sunLight.position.set(200, 100, 150);
    scene.add(sunLight);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const earthTexture = createProceduralEarthTexture();
    const earthGeometry = new THREE.SphereGeometry(100, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.7,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);

    const atmosGeometry = new THREE.SphereGeometry(106, 64, 64);
    const atmosMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeometry, atmosMaterial);
    globeGroup.add(atmosMesh);

    const starsGeo = new THREE.BufferGeometry();
    const starCount = 600;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 800;
      starPos[i + 1] = (Math.random() - 0.5) * 800;
      starPos[i + 2] = (Math.random() - 0.5) * 800;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      transparent: true,
      opacity: 0.6,
    });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isDraggingRef.current && !isDrilling) {
        globeGroup.rotation.y += 0.001;
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
    if (particlesRef.current) {
      globeGroupRef.current.remove(particlesRef.current);
      particlesRef.current.geometry.dispose();
    }

    const originVec = latLonToVector3(originLat, originLon, 102);
    const antiVec = latLonToVector3(antiLat, antiLon, 102);

    const laserPoints = [originVec, new THREE.Vector3(0, 0, 0), antiVec];
    const laserGeo = new THREE.BufferGeometry().setFromPoints(laserPoints);
    const laserMat = new THREE.LineBasicMaterial({
      color: 0xf43f5e,
      linewidth: 3,
      transparent: true,
      opacity: 0.9,
    });
    const laser = new THREE.Line(laserGeo, laserMat);
    globeGroupRef.current.add(laser);
    laserRef.current = laser;

    const pinGeo = new THREE.SphereGeometry(2.5, 16, 16);
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
    const targetZ = 130;

    const drillInterval = setInterval(() => {
      progress += 0.04;
      if (progress <= 1) {
        cameraRef.current!.position.z = THREE.MathUtils.lerp(startZ, targetZ, progress);
        globeGroupRef.current!.rotation.y += 0.08;
      } else if (progress <= 2) {
        const subP = progress - 1;
        cameraRef.current!.position.z = THREE.MathUtils.lerp(targetZ, startZ, subP);
        globeGroupRef.current!.rotation.y += 0.04;
      } else {
        clearInterval(drillInterval);
        if (onDrillComplete) onDrillComplete();
      }
    }, 30);

    return () => clearInterval(drillInterval);
  }, [isDrilling, onDrillComplete]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
    />
  );
};
