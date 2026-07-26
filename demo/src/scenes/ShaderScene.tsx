import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import TextGeometry, { TextAlign, useFont } from 'three-text-geometry';
import * as THREE from 'three/webgpu';

import { useTextData } from '~/hooks/useTextData';
import { createEffectMaterial } from '~/shaders/effect';

const fontUrl = 'https://raw.githubusercontent.com/futamura/three-text-geometry/develop/tests/fonts/OdudoMono-Regular-64.json';
const textureUrl = 'https://raw.githubusercontent.com/futamura/three-text-geometry/develop/tests/fonts/OdudoMono-Regular-64.png';

const DURATION = 3;

export default function ShaderScene() {
  const { font, texture, isLoading } = useFont(fontUrl, textureUrl);
  const { staticText, randomText } = useTextData();
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<TextGeometry>(null);
  const timeRef = useRef(0);

  const effect = useMemo(() => {
    if (!texture) return null;
    return createEffectMaterial({ map: texture, color: new THREE.Color(0x999999) });
  }, [texture]);

  useEffect(() => {
    if (!meshRef.current || !geometryRef.current) return;
    const geom = geometryRef.current;
    geom.computeBoundingBox();
    const box = new THREE.Vector3();
    geom.boundingBox?.getSize(box);
    meshRef.current.position.set(-box.x / 2, box.y / 2, 0);
  }, [font, texture]);

  useFrame((_, delta) => {
    if (!effect || !geometryRef.current || !meshRef.current) return;
    timeRef.current += delta;
    effect.uniforms.iGlobalTime.value = timeRef.current;
    effect.uniforms.animate.value = timeRef.current / DURATION;
    if (timeRef.current > DURATION) {
      timeRef.current = 0;
      geometryRef.current.update(randomText());
      geometryRef.current.computeBoundingBox();
      const box = new THREE.Vector3();
      geometryRef.current.boundingBox?.getSize(box);
      meshRef.current.position.set(-box.x / 2, box.y / 2, 0);
    }
  });

  useEffect(() => {
    return () => {
      effect?.material.dispose();
    };
  }, [effect]);

  if (isLoading || !font || !texture || !effect) return null;

  return (
    <mesh ref={meshRef} rotation={[Math.PI, 0, 0]} material={effect.material}>
      <textGeometry ref={geometryRef} args={[staticText(), { font, align: TextAlign.Left, width: 1600, flipY: texture.flipY }]} />
    </mesh>
  );
}
