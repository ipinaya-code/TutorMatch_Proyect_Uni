import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

// Doble hélice: dos hebras (tutor / estudiante) unidas por un enlace = una pareja asignada.
function Helix() {
  const g = useRef()
  useFrame((_, dt) => { g.current.rotation.y += dt * 0.35 })
  const rungs = useMemo(() => Array.from({ length: 30 }, (_, i) => ({ a: i * 0.48, y: (i - 15) * 0.2 })), [])
  return (
    <group ref={g} rotation={[0, 0, 0.35]}>
      {rungs.map(({ a, y }, i) => {
        const x = Math.cos(a) * 1.05, z = Math.sin(a) * 1.05
        return (
          <group key={i}>
            <mesh position={[x, y, z]}><sphereGeometry args={[0.11, 16, 16]} /><meshStandardMaterial color="#3DD6C6" emissive="#3DD6C6" emissiveIntensity={0.4} /></mesh>
            <mesh position={[-x, y, -z]}><sphereGeometry args={[0.11, 16, 16]} /><meshStandardMaterial color="#FFB020" emissive="#FFB020" emissiveIntensity={0.4} /></mesh>
            <group position={[0, y, 0]} rotation={[0, -a, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.02, 0.02, 2.1, 6]} /><meshStandardMaterial color="#EAF0EE" opacity={0.5} transparent /></mesh>
            </group>
          </group>
        )
      })}
    </group>
  )
}

export default function Helix3D() {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5.5], fov: 45 }} aria-label="Hélice de ADN animada">
      <ambientLight intensity={0.7} />
      <pointLight position={[4, 4, 4]} intensity={40} />
      <Helix />
    </Canvas>
  )
}
