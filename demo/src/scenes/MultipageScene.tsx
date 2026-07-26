import { useEffect, useMemo, useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import TextGeometry, { MultiPageTextNodeMaterial, TextAlign, useFont } from 'three-text-geometry';
import * as THREE from 'three/webgpu';

import { useTextData } from '~/hooks/useTextData';

const fontUrl = 'https://raw.githubusercontent.com/futamura/three-text-geometry/develop/tests/fonts/OdudoMono-Regular-64-Multipage.json';
const textureUrls = [
  'https://raw.githubusercontent.com/futamura/three-text-geometry/develop/tests/fonts/OdudoMono-Regular-64-Multipage-0.png',
  'https://raw.githubusercontent.com/futamura/three-text-geometry/develop/tests/fonts/OdudoMono-Regular-64-Multipage-1.png',
  'https://raw.githubusercontent.com/futamura/three-text-geometry/develop/tests/fonts/OdudoMono-Regular-64-Multipage-2.png',
];

export default function MultipageScene() {
  const { font, isLoading: isFontLoading } = useFont(fontUrl, null);
  const textures = useLoader(THREE.TextureLoader, textureUrls);
  const { staticText } = useTextData();
  const meshRef = useRef<THREE.Mesh>(null);

  const material = useMemo(() => {
    if (!textures || textures.length === 0) return null;
    return new MultiPageTextNodeMaterial({
      textures: textures,
      transparent: true,
      opacity: 0.95,
      alphaTest: 0.5,
      color: new THREE.Color(0x999999),
    });
  }, [textures]);

  useEffect(() => {
    if (!meshRef.current) return;
    const geom = meshRef.current.geometry as TextGeometry;
    geom.computeBoundingBox();
    const box = new THREE.Vector3();
    geom.boundingBox?.getSize(box);
    meshRef.current.position.set(-box.x / 2, box.y / 2, 0);
  }, [font, textures]);

  useEffect(() => {
    return () => {
      material?.dispose();
    };
  }, [material]);

  if (isFontLoading || !font || !textures || !material) return null;

  return (
    <mesh ref={meshRef} rotation={[Math.PI, 0, 0]} material={material}>
      <textGeometry args={[staticText(), { font, align: TextAlign.Left, width: 1600, flipY: textures[0].flipY, multipage: true }]} />
    </mesh>
  );
}
