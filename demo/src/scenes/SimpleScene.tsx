import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TextGeometry, { TextAlign, useFont } from 'three-text-geometry';
import * as THREE from 'three/webgpu';

import { useTextData } from '~/hooks/useTextData';

const fontBaseUrl = 'https://raw.githubusercontent.com/futamura/three-text-geometry/develop/tests/fonts/';
const defaultFontFile = 'Lato-Regular-64.fnt';
const defaultTextureFile = 'lato.png';

export default function SimpleScene() {
  // `?font=` and `?texture=` name a file under `tests/fonts`, never a whole URL, so the scene cannot
  // be pointed at an arbitrary host. They let the e2e run render every BMFont format through this
  // one scene; with neither the demo behaves exactly as before. An unset `texture` is meaningful
  // rather than missing: `Arial.bin` has no atlas in the repository, and the untextured material
  // below still shows whether the geometry was laid out.
  const [searchParams] = useSearchParams();
  const fontUrl = `${fontBaseUrl}${searchParams.get('font') ?? defaultFontFile}`;
  const textureFile = searchParams.has('font') ? searchParams.get('texture') : defaultTextureFile;
  const textureUrl = textureFile ? `${fontBaseUrl}${textureFile}` : null;

  const { font, texture, isLoading } = useFont(fontUrl, textureUrl);
  const { textList, randomText } = useTextData();
  // The passages differ in length by a factor of two, so a random one makes the share of the canvas
  // the text covers vary as much. That is fine for the demo, but the e2e run compares that share
  // against a floor: pinning the longest passage whenever a font was requested keeps the comparison
  // about the font, not about which passage came up.
  const [text] = useState(() => (searchParams.has('font') ? textList[0]! : randomText()));
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!meshRef.current) return;
    const geom = meshRef.current.geometry as TextGeometry;
    geom.computeBoundingBox();
    const box = new THREE.Vector3();
    geom.boundingBox?.getSize(box);
    meshRef.current.position.set(-box.x / 2, box.y / 2, 0);
  }, [font, texture, text]);

  if (isLoading || !font) return null;
  if (textureUrl && !texture) return null;

  return (
    <mesh ref={meshRef} rotation={[Math.PI, 0, 0]}>
      <textGeometry args={[text, { font, align: TextAlign.Left, width: 1600, flipY: texture?.flipY ?? true }]} />
      <meshBasicMaterial map={texture ?? null} side={THREE.DoubleSide} transparent color={0x999999} />
    </mesh>
  );
}
