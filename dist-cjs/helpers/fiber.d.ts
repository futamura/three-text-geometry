import { ThreeElement } from '@react-three/fiber';
import TextGeometry from '../TextGeometry.js';
export type TextGeometryProps = ThreeElement<typeof TextGeometry>;
declare module '@react-three/fiber' {
    interface ThreeElements {
        textGeometry: TextGeometryProps;
    }
}
//# sourceMappingURL=fiber.d.ts.map