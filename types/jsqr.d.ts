declare module 'jsqr' {
  interface Point {
    x: number;
    y: number;
  }

  interface QRLocation {
    topLeft: Point;
    topRight: Point;
    bottomLeft: Point;
    bottomRight: Point;
    topLeftFinder: Point;
    topRightFinder: Point;
    bottomLeftFinder: Point;
    bottomRightAlignment?: Point;
  }

  interface QRCode {
    binaryData: number[];
    data: string;
    location: QRLocation;
  }

  function jsQR(imageData: Uint8ClampedArray, width: number, height: number): QRCode | null;

  export default jsQR;
} 