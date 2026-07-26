import { useCallback, useEffect, useRef } from 'react';
import TextGeometry, { TextAlign, useFont } from 'three-text-geometry';
import * as THREE from 'three/webgpu';

import ShuffleText, { ShuffleOption, ShuffleState } from '~/effects/shuffle';
import { useTextData } from '~/hooks/useTextData';

const fontUrl = 'https://raw.githubusercontent.com/futamura/three-text-geometry/develop/tests/fonts/OdudoMono-Regular-64.json';
const textureUrl = 'https://raw.githubusercontent.com/futamura/three-text-geometry/develop/tests/fonts/OdudoMono-Regular-64.png';

const shuffleOption: ShuffleOption = {
  shuffleText: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  ignoreRegex: /\s|\t|\n|\r|(\n\r|\.|,)/,
  delay: { min: 0, max: 0 },
  fadeDuration: { min: 500, max: 700 },
  shuffleDuration: { min: 1000, max: 2000 },
  interval: { min: 20, max: 40 },
};

export default function ShuffleScene() {
  const { font, texture, isLoading } = useFont(fontUrl, textureUrl);
  const { staticText } = useTextData();
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<TextGeometry>(null);
  const shuffleRef = useRef<ShuffleText | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const startShuffle = useCallback(
    (delay: number) => {
      shuffleRef.current?.cancel();
      shuffleRef.current = new ShuffleText(staticText(), shuffleOption, (text: string, state: ShuffleState) => {
        geometryRef.current?.update(text);
        if (state === ShuffleState.Completed) {
          startShuffle(3000);
        }
      });
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        shuffleRef.current?.start();
      }, delay);
    },
    [staticText],
  );

  useEffect(() => {
    if (!meshRef.current || !geometryRef.current) return;
    const geom = geometryRef.current;
    geom.computeBoundingBox();
    const box = new THREE.Vector3();
    geom.boundingBox?.getSize(box);
    meshRef.current.position.set(-box.x / 2, box.y / 2, 0);
  }, [font, texture]);

  useEffect(() => {
    if (!font || !texture) return;
    startShuffle(1000);
    return () => {
      shuffleRef.current?.cancel();
      clearTimeout(timeoutRef.current);
    };
  }, [font, texture, startShuffle]);

  if (isLoading || !font || !texture) return null;

  return (
    <mesh ref={meshRef} rotation={[Math.PI, 0, 0]}>
      <textGeometry ref={geometryRef} args={[staticText(), { font, align: TextAlign.Left, width: 1600, flipY: texture.flipY }]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} transparent color={0x999999} />
    </mesh>
  );
}
