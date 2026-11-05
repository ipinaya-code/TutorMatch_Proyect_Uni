import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

// Doble hélice a pantalla completa: una hebra azul y otra amarilla (colores EMI).
// Cada peldaño une un tutor con un estudiante = una pareja asignada.
function Helix() {
  const g = useRef(), mouse = useRef({ x: 0, y: 0 })
  const { viewport } = useThree()
  useEffect(() => {
    const m = (e) => { mouse.current.x = (e.clientX / innerWidth) * 2 - 1; mouse.current.y = (e.clientY / innerHeight) * 2 - 1 }
    window.addEventListener('pointermove', m)
    return () => window.removeEventListener('pointermove', m)
  }, [])
  const rungs = useMemo(() => Array.from({ length: 52 }, (_, i) => ({ a: i * 0.48, y: (i - 26) * 0.2 })), [])
  const wide = viewport.width > 7
  const scale = wide ? 1.5 : Math.min(1.3, viewport.width / 2.4)
  useFrame((_, dt) => {
    g.current.rotation.y += dt * 0.3
    g.current.rotation.x += (mouse.current.y * 0.25 - g.current.rotation.x) * 0.05
    const tx = (wide ? viewport.width * 0.2 : 0) + mouse.current.x * 0.35
    g.current.position.x += (tx - g.current.position.x) * 0.05
  })
  return (
    <group ref={g} scale={scale} rotation={[0, 0, 0.35]}>
      {rungs.map(({ a, y }, i) => {
        const x = Math.cos(a) * 1.05, z = Math.sin(a) * 1.05
        return (
          <group key={i}>
            <mesh position={[x, y, z]}><sphereGeometry args={[0.12, 16, 16]} /><meshStandardMaterial color="#579DFF" emissive="#579DFF" emissiveIntensity={0.45} /></mesh>
            <mesh position={[-x, y, -z]}><sphereGeometry args={[0.12, 16, 16]} /><meshStandardMaterial color="#F8D800" emissive="#F8D800" emissiveIntensity={0.4} /></mesh>
            <group position={[0, y, 0]} rotation={[0, -a, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.02, 0.02, 2.1, 6]} /><meshStandardMaterial color="#F3F6FB" opacity={0.45} transparent /></mesh>
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
