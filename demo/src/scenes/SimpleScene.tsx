import { useEffect, useRef, useState } from 'react';
import TextGeometry, { TextAlign, useFont } from 'three-text-geometry';
import * as THREE from 'three/webgpu';

import { useTextData } from '~/hooks/useTextData';

const fontUrl = 'https://raw.githubusercontent.com/futamura/three-text-geometry/develop/tests/fonts/Lato-Regular-64.fnt';
const textureUrl = 'https://raw.githubusercontent.com/futamura/three-text-geometry/develop/tests/fonts/lato.png';

export default function SimpleScene() {
  const { font, texture, isLoading } = useFont(fontUrl, textureUrl);
  const { randomText } = useTextData();
  const [text] = useState(() => randomText());
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;
    const geom = meshRef.current.geometry as TextGeometry;
    geom.computeBoundingBox();
    const box = new THREE.Vector3();
    geom.boundingBox?.getSize(box);
    meshRef.current.position.set(-box.x / 2, box.y / 2, 0);
  }, [font, texture, text]);

  if (isLoading || !font || !texture) return null;

  return (
    <mesh ref={meshRef} rotation={[Math.PI, 0, 0]}>
      <textGeometry args={[text, { font, align: TextAlign.Left, width: 1600, flipY: texture.flipY }]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent color={0x999999} />
    </mesh>
  );
}
