import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, OrbitControls, Stars, PerspectiveCamera, Sparkles } from "@react-three/drei";
import * as THREE from "three";

function Cloud({ position, speed, size }: { position: [number, number, number]; speed: number; size: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.position.x += Math.sin(state.clock.elapsedTime * speed) * 0.005;
      mesh.current.position.y += Math.cos(state.clock.elapsedTime * speed) * 0.005;
    }
  });

  return (
    <mesh position={position} ref={mesh}>
      <icosahedronGeometry args={[size, 1]} />
      <meshStandardMaterial color="#888" flatShading transparent opacity={0.6} />
    </mesh>
  );
}

function LowPolyPlant({ position, scale = 1, type = "grass" }: { position: [number, number, number]; scale?: number; type?: string }) {
  if (type === "grass") {
    // New Sapling/Sprout Style based on user image
    return (
      <group position={position} scale={scale}>
        {/* Stem */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.2, 8]} />
          <meshStandardMaterial color="#4ade80" flatShading emissive="#4ade80" emissiveIntensity={0.2} />
        </mesh>
        
        {/* Left Leaf */}
        <mesh position={[-0.04, 0.14, 0]} rotation={[0, 0, 0.8]} scale={[1, 0.3, 1.8] as any}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial 
            color="#4ade80" 
            flatShading 
            emissive="#4ade80" 
            emissiveIntensity={0.3} 
          />
        </mesh>
        
        {/* Right Leaf */}
        <mesh position={[0.04, 0.14, 0]} rotation={[0, 0, -0.8]} scale={[1, 0.3, 1.8] as any}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial 
            color="#4ade80" 
            flatShading 
            emissive="#4ade80" 
            emissiveIntensity={0.3} 
          />
        </mesh>
      </group>
    );
  }
  
  if (type === "sprite") {
    return (
      <group position={position} scale={scale}>
        <mesh>
          <octahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={2} flatShading />
        </mesh>
      </group>
    );
  }
  
  return null;
}

function PlantBubble({ type, progress }: { type: string; progress: number }) {
  const meshRef = useRef<THREE.Group>(null);
  const initialPos = useMemo(() => [
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 5
  ], []);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      // Floating movement
      meshRef.current.position.y += Math.sin(t * 0.5) * 0.002;
      meshRef.current.position.x += Math.cos(t * 0.3) * 0.001;
      // Rotation
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={meshRef} position={initialPos as any}>
      {/* White Semi-transparent Bubble */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.2} 
          metalness={0.2} 
          roughness={0.0}
          envMapIntensity={2}
        />
      </mesh>
      {/* Plant Inside with glow */}
      <LowPolyPlant position={[0, -0.1, 0]} type={type} scale={1.8} />
    </group>
  );
}

function DesertPlanet({ progress, mode }: { progress: number; mode: string }) {
  const planetRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Transition colors based on progress (0 to 1)
  // Lighter, more visible Deep Healing Blue or Sports Green
  const baseBlue = "#2a4d91";
  const baseGreen = "#1b4d3e";
  const lushGreen = "#2ecc71";
  
  const startColor = mode === "sports" ? baseGreen : baseBlue;
  
  const currentColor = useMemo(() => {
    const color = new THREE.Color(startColor).lerp(new THREE.Color(lushGreen), progress);
    return color;
  }, [progress, startColor]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (planetRef.current) {
      // Axial tilt and slow rotation
      planetRef.current.rotation.y += 0.003;
    }
    if (glowRef.current) {
      // Breathing effect: oscillate opacity and scale slightly
      const pulse = (Math.sin(t * 1.5) + 1) / 2; // 0 to 1
      (glowRef.current.material as THREE.MeshStandardMaterial).opacity = 0.1 + pulse * 0.15;
      const s = 1.05 + pulse * 0.02;
      glowRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group>
      {/* Outer Atmosphere Glow - remains large */}
      <mesh ref={glowRef}>
        <icosahedronGeometry args={[1.22, 3]} />
        <meshStandardMaterial 
          color={mode === "sports" ? "#4ade80" : "#4B7BFF"} 
          transparent 
          opacity={0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Planet Mesh - Smaller (1.2 instead of 2.0) */}
      <mesh ref={planetRef} rotation={[0.4, 0, 0]}>
        <icosahedronGeometry args={[1.2, 2]} />
        <meshStandardMaterial 
          color={currentColor} 
          flatShading 
          roughness={0.6}
          metalness={0.2}
          emissive={currentColor}
          emissiveIntensity={0.05}
        />
      </mesh>
      
      {/* Healing Rings - remain large to frame the small planet */}
      <group rotation={[0.4, 0, 0.2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.4, 0.005, 16, 100]} />
          <meshBasicMaterial color="#4ade80" transparent opacity={0.2} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0.5, 0]}>
          <torusGeometry args={[2.6, 0.003, 16, 100]} />
          <meshBasicMaterial color="#4deaff" transparent opacity={0.1} />
        </mesh>
      </group>

      {/* Floating Asset Bubbles (No longer on surface) */}
      {progress > 0.1 && (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <PlantBubble type="grass" progress={progress} />
        </Float>
      )}
      
      {progress > 0.4 && (
        <Float speed={1.5} rotationIntensity={1} floatIntensity={1.5}>
          <group position={[-3, 2, -1]}>
             <PlantBubble type="grass" progress={progress} />
          </group>
        </Float>
      )}

      {progress > 0.7 && (
        <Float speed={3} rotationIntensity={2} floatIntensity={2}>
           <group position={[2, -2, 1]}>
              <PlantBubble type="sprite" progress={progress} />
           </group>
        </Float>
      )}
    </group>
  );
}

function Meteor() {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    // Show one meteor every 60 seconds (approx)
    // We can use the clock to trigger it
    const t = state.clock.elapsedTime;
    const cycle = t % 60; 
    const isVisible = cycle > 0 && cycle < 2; // Lasts 2 seconds
    
    if (meshRef.current && trailRef.current) {
      if (isVisible) {
        const progress = cycle / 2;
        const startX = -15;
        const startY = 10;
        const endX = 15;
        const endY = -5;
        
        meshRef.current.position.set(
          startX + (endX - startX) * progress,
          startY + (endY - startY) * progress,
          -10
        );
        meshRef.current.visible = true;
        trailRef.current.visible = true;
      } else {
        meshRef.current.visible = false;
        trailRef.current.visible = false;
      }
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#FFD700" />
        <pointLight color="#FFD700" intensity={2} distance={5} />
      </mesh>
      <group ref={trailRef}>
        {/* Simple visual trail could be added here if needed, 
            but a moving point light + glow is effective */}
      </group>
    </group>
  );
}

export default function PlanetCanvas({ focusSeconds, status, mode = "learning" }: { focusSeconds: number; status: "idle" | "focusing"; mode?: string }) {
  // Calculate progress based on time (0 to 10 minutes = 600s)
  const progress = Math.min(focusSeconds / 600, 1);
  const isRainy = progress < 0.1;

  return (
    <div className="w-full h-full">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 1, 7]} fov={45} />
        
        <color attach="background" args={isRainy ? ["#0c0d18"] : ["#080911"]} />
        
        <fog attach="fog" args={["#080911", 5, 15]} />
        
        <ambientLight intensity={isRainy ? 0.3 : 0.8} />
        <pointLight position={[10, 10, 10]} intensity={isRainy ? 0.8 : 2} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4B7BFF" />
        <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={2} color="#4ade80" />
        
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <Sparkles 
          count={50} 
          scale={6} 
          size={2} 
          speed={0.4} 
          opacity={0.5} 
          color="#4deaff" 
        />
        
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <DesertPlanet progress={progress} mode={mode} />
        </Float>

        {status === "focusing" && <Meteor />}

        {isRainy && (
          <group>
            <Cloud position={[2, 2, 0]} speed={1} size={0.3} />
            <Cloud position={[-2, 1.5, 1]} speed={1.2} size={0.4} />
            <Cloud position={[0, 3, -2]} speed={0.8} size={0.5} />
          </group>
        )}

        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate={true} 
          autoRotateSpeed={status === "idle" ? 1 : 0.3} 
        />
      </Canvas>
      
      {/* HUD overlays can go here if needed, but mostly in Focus.tsx */}
    </div>
  );
}
