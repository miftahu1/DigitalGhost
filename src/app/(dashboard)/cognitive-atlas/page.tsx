"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useDecryptedMemories } from '@/hooks/use-decrypted-memories';
import { useMemo } from 'react';

const CognitiveAtlasPage = () => {
  const { decryptedMemories, loading } = useDecryptedMemories();

  const memoryPoints = useMemo(() => {
    if (!decryptedMemories) return [];
    return decryptedMemories.map((memory, i) => {
      const x = Math.random() * 20 - 10;
      const y = Math.random() * 20 - 10;
      const z = Math.random() * 20 - 10;
      return {
        position: [x, y, z],
        text: memory.content.substring(0, 20) + '...',
      };
    });
  }, [decryptedMemories]);

  if (loading) {
    return <div>Loading Cognitive Atlas...</div>;
  }

  return (
    <div style={{ height: '100vh' }}>
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        {memoryPoints.map((point, i) => (
          <mesh key={i} position={point.position as [number, number, number]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={'#007BFF'} />
            <Text
              position={[0, 0.2, 0]}
              fontSize={0.2}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {point.text}
            </Text>
          </mesh>
        ))}
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default CognitiveAtlasPage;
