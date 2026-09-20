import { extend, ThreeElement } from '@react-three/fiber';

import TextGeometry from '../TextGeometry.js';

/* Register TextGeometry with R3F catalog on import */
extend({ TextGeometry: TextGeometry });

/**
 * TextGeometryProps is a type that defines the props for the TextGeometry component.
 * It is used to define the props for the TextGeometry component in React Three Fiber.
 */
export type TextGeometryProps = ThreeElement<typeof TextGeometry>;

/* React 19 / R3F v9 compatible module augmentation */
declare module '@react-three/fiber' {
  interface ThreeElements {
    textGeometry: TextGeometryProps;
  }
}
