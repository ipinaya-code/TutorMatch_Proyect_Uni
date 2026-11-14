import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

// Nodo / Neurona individual frontal con resplandor dinámico y etiquetas claras
function NeuronNode({ position, color, label, sublabel, isActive = true, isMobile = false }) {
  const meshRef = useRef()
  const glowRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (meshRef.current) {
      const scale = 1 + Math.sin(t * 2.8 + position[1] * 2) * 0.07
      meshRef.current.scale.set(scale, scale, scale)
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.22 + Math.sin(t * 3.5 + position[0]) * 0.1
    }
  })

  const radius = isMobile ? 0.28 : 0.36
  const glowRadius = isMobile ? 0.42 : 0.52
  const mainFontSize = isMobile ? 0.22 : 0.28
  const subFontSize = isMobile ? 0.18 : 0.22

  return (
    <group position={position}>
      {/* Halo de resplandor externo */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[glowRadius, 20, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} />
      </mesh>

      {/* Núcleo de la neurona */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 0.85 : 0.3}
          roughness={0.12}
          metalness={0.88}
        />
      </mesh>

      {/* Etiqueta principal (Debajo del nodo) */}
      {label && (
        <Text
          position={[0, -(radius + (isMobile ? 0.28 : 0.35)), 0]}
          fontSize={mainFontSize}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
        >
          {label}
        </Text>
      )}

      {/* Subetiqueta (Encima del nodo, ej: % o índice) */}
      {sublabel && (
        <Text
          position={[0, radius + (isMobile ? 0.24 : 0.32), 0]}
          fontSize={subFontSize}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
        >
          {sublabel}
        </Text>
      )}
    </group>
  )
}

// Sinapsis ultra dinámica: paquetes de energía en tránsito continuo
function DynamicSynapse({ start, end, color = "#00d2ff", speed = 1.4, count = 2, isMobile = false }) {
  const startVec = useMemo(() => new THREE.Vector3(...start), [start])
  const endVec = useMemo(() => new THREE.Vector3(...end), [end])
  const linePoints = useMemo(() => [startVec, endVec], [startVec, endVec])

  const offsets = useMemo(() => Array.from({ length: count }, (_, i) => i / count), [count])
  const pulsesRef = useRef([])

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime() * speed
    pulsesRef.current.forEach((mesh, i) => {
      if (mesh) {
        const progress = (elapsed + offsets[i]) % 1
        mesh.position.lerpVectors(startVec, endVec, progress)
        const baseScale = isMobile ? 0.07 : 0.09
        const pScale = baseScale + Math.sin(progress * Math.PI) * 0.05
        mesh.scale.set(pScale, pScale, pScale)
      }
    })
  })

  return (
    <group>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePoints.length}
            array={new Float32Array([startVec.x, startVec.y, startVec.z, endVec.x, endVec.y, endVec.z])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.32} />
      </line>

      {offsets.map((_, i) => (
        <mesh key={i} ref={(el) => (pulsesRef.current[i] = el)}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  )
}

// Escenario 3D Amplio, Responsivo y Fijo de Frente
export default function NeuralNetwork3D({ keywords = [], topTutors = [] }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Coordenadas ampliadas para aprovechar todo el ancho del contenedor sin chocar con el encabezado
  // En laptop: capas separadas horizontalmente de -5.2 a +5.2
  // En móvil: capas adaptadas de -2.8 a +2.8
  const xIn = isMobile ? -2.7 : -5.0
  const xHid = 0.0
  const xOut = isMobile ? 2.7 : 5.0

  // Capa 1: Entrada (Tokens procesados)
  const inputNodes = useMemo(() => {
    const list = keywords.length > 0 ? keywords.slice(0, 4) : ['IA', 'MVC', 'ARQUI', 'AUTO']
    const spacing = isMobile ? 0.85 : 1.15
    const offset = ((list.length - 1) * spacing) / 2
    return list.map((k, i) => ({
      id: `in-${i}`,
      pos: [xIn, offset - i * spacing - (isMobile ? 0.1 : 0.0), 0],
      label: k.toUpperCase(),
      sublabel: `X${i + 1}`,
      color: '#00e5ff'
    }))
  }, [keywords, isMobile, xIn])

  // Capa 2: Oculta (Procesamiento semántico / Pesos sinápticos)
  const hiddenNodes = useMemo(() => {
    const spacing = isMobile ? 0.82 : 1.1
    const offset = (3 * spacing) / 2
    return [
      { id: 'h-0', pos: [xHid, offset - 0 * spacing, 0], label: 'TF-IDF', sublabel: 'H1', color: '#ffb703' },
      { id: 'h-1', pos: [xHid, offset - 1 * spacing, 0], label: 'COSINE', sublabel: 'H2', color: '#fb8500' },
      { id: 'h-2', pos: [xHid, offset - 2 * spacing, 0], label: 'EMBED', sublabel: 'H3', color: '#ffb703' },
      { id: 'h-3', pos: [xHid, offset - 3 * spacing, 0], label: 'WEIGHTS', sublabel: 'H4', color: '#fb8500' }
    ]
  }, [isMobile, xHid])

  // Capa 3: Salida (Docentes tutores recomendados con porcentaje de afinidad)
  const outputNodes = useMemo(() => {
    const defaultList = [
      { nombre: 'Mendoza', score: '92%' },
      { nombre: 'Soria', score: '88%' },
      { nombre: 'Arce', score: '76%' }
    ]
    const list = topTutors.length > 0
      ? topTutors.slice(0, 3).map((t) => ({
          nombre: t.nombre.replace('Ing. ', '').split(' ')[0],
          score: `${t.afinidad_porcentaje}%`
        }))
      : defaultList

    const spacing = isMobile ? 0.95 : 1.3
    const offset = ((list.length - 1) * spacing) / 2
    return list.map((t, i) => ({
      id: `out-${i}`,
      pos: [xOut, offset - i * spacing, 0],
      label: t.nombre,
      sublabel: t.score,
      color: '#06d6a0'
    }))
  }, [topTutors, isMobile, xOut])

  // Cámara adaptativa: más alejada en pantallas pequeñas para encuadrar perfecto
  const camPos = isMobile ? [0, -0.1, 7.8] : [0, 0, 7.0]

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-bone/20 bg-slate-950 shadow-2xl relative flex flex-col">
      {/* Encabezado fuera de colisión visual, integrado en la cabecera */}
      <div className="px-5 py-3 border-b border-bone/10 bg-slate-900/60 flex flex-wrap items-center justify-between gap-2 z-10">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-azul font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-azul animate-ping" />
            Red Neuronal Artificial EMI · Flujo Frontal Activo
          </span>
          <p className="text-[11px] text-bone/60 mt-0.5">
            Capa de Entrada (Tokens) ➔ Capa Oculta Semántica ➔ Capa de Salida (Docentes Afines)
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-[#00e5ff]">
            <i className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] shadow-sm shadow-[#00e5ff]" />
            Entrada
          </span>
          <span className="flex items-center gap-1.5 text-[#ffb703]">
            <i className="w-2.5 h-2.5 rounded-full bg-[#ffb703] shadow-sm shadow-[#ffb703]" />
            Oculta
          </span>
          <span className="flex items-center gap-1.5 text-[#06d6a0]">
            <i className="w-2.5 h-2.5 rounded-full bg-[#06d6a0] shadow-sm shadow-[#06d6a0]" />
            Salida
          </span>
        </div>
      </div>

      {/* Contenedor amplio 3D: altura responsiva (380px en móvil, 460px en laptop/desktop) */}
      <div className="w-full h-[360px] sm:h-[420px] md:h-[460px] relative bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950">
        <Canvas camera={{ position: camPos, fov: 50 }}>
          <ambientLight intensity={0.9} />
          <pointLight position={[0, 0, 7]} intensity={1.6} />
          <directionalLight position={[6, 6, 6]} intensity={0.9} />

          {/* Sinapsis Capa Entrada -> Capa Oculta */}
          {inputNodes.map((inN) =>
            hiddenNodes.map((hidN) => (
              <DynamicSynapse
                key={`${inN.id}-${hidN.id}`}
                start={inN.pos}
                end={hidN.pos}
                color="#00a6fb"
                speed={1.5}
                count={2}
                isMobile={isMobile}
              />
            ))
          )}

          {/* Sinapsis Capa Oculta -> Capa Salida */}
          {hiddenNodes.map((hidN) =>
            outputNodes.map((outN) => (
              <DynamicSynapse
                key={`${hidN.id}-${outN.id}`}
                start={hidN.pos}
                end={outN.pos}
                color="#06d6a0"
                speed={1.8}
                count={2}
                isMobile={isMobile}
              />
            ))
          )}

          {/* Renderizado de Nodos de Entrada */}
          {inputNodes.map((node) => (
            <NeuronNode
              key={node.id}
              position={node.pos}
              color={node.color}
              label={node.label}
              sublabel={node.sublabel}
              isMobile={isMobile}
            />
          ))}

          {/* Renderizado de Nodos Ocultos */}
          {hiddenNodes.map((node) => (
            <NeuronNode
              key={node.id}
              position={node.pos}
              color={node.color}
              label={node.label}
              sublabel={node.sublabel}
              isMobile={isMobile}
            />
          ))}

          {/* Renderizado de Nodos de Salida */}
          {outputNodes.map((node) => (
            <NeuronNode
              key={node.id}
              position={node.pos}
              color={node.color}
              label={node.label}
              sublabel={node.sublabel}
              isMobile={isMobile}
            />
          ))}
        </Canvas>
      </div>
    </div>
  )
}
