/**
 * @jest-environment jsdom
 */
import './helpers/webgpu-mock';

import * as fs from 'fs';
import TextGeometry, { TextAlign, WordWrapMode } from '@three-text-geometry/index';
import { MultiPageTextNodeMaterial } from '@three-text-geometry/materials';
import { BMFontAsciiParser } from '@three-text-geometry/parser';

import THREE from './helpers/webgl-mock';

describe('TextGeometry', () => {
  /** Setup Font */
  // const xml = fs.readFileSync('tests/fonts/Roboto-Regular.xml').toString()
  // const font = new BMFontXMLParser().parse(xml)
  const ascii = fs.readFileSync('tests/fonts/Lato-Regular-64.fnt').toString();
  const font = new BMFontAsciiParser().parse(ascii);
  const _texture = new THREE.TextureLoader().load('tests/font/lato.png');

  /** Setup Renderer */
  const width = 1024;
  const height = 768;
  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let camera: THREE.Camera;

  beforeEach(() => {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setClearColor(0xffffff, 0);
    window.document.body.append(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000104, 0.0000675);

    const eye = new THREE.Vector3(0, 0, 2000);
    const target = new THREE.Vector3();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(eye.x, eye.y, eye.z);
    camera.lookAt(target);
    scene.add(camera);

    jest.spyOn(console, 'debug').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Option', () => {
    test('No Font', async () => {
      // new TextGeometry('Hello World');
      // expect(console.error).toHaveBeenCalledWith('Must specify a `font` in options');
      try {
        new TextGeometry('Hello World');
      } catch (e) {
        expect(e).toEqual(new TypeError('Must specify a `font` in options'));
      }
    });

    test('All', async () => {
      const option = {
        font: font,
        start: 1,
        end: 10,
        width: 3,
        align: TextAlign.Left,
        mode: WordWrapMode.Pre,
        letterSpacing: 1,
        lineHeight: font.common.lineHeight,
        tabSize: 1,
        flipY: true,
        multipage: false,
      };
      const geometry = new TextGeometry('Hello World', option);
      expect(geometry.option).toStrictEqual(option);
    });

    test('TextGeometry', async () => {
      const geometry = new TextGeometry('Hello World', { font: font });
      expect(geometry).toBeInstanceOf(TextGeometry);
    });

    test('text setter re-runs the layout', async () => {
      const geometry = new TextGeometry('Hello World', { font: font });
      geometry.text = 'Howdy World';
      expect(geometry.text).toStrictEqual('Howdy World');
      expect(geometry.visibleGlyphs.map((glyph) => String.fromCharCode(glyph.data.id)).join('')).toStrictEqual('HowdyWorld');
    });

    test('text setter re-derives the end index', async () => {
      const geometry = new TextGeometry('Hello', { font: font });
      geometry.text = 'Hello World';
      expect(geometry.text).toStrictEqual('Hello World');
      expect(geometry.option.end).toStrictEqual(11);
      expect(geometry.visibleGlyphs.length).toStrictEqual(10);
    });

    test('update re-derives the end index when it is given no option', async () => {
      const geometry = new TextGeometry('Hello', { font: font });
      geometry.update('Hello World');
      expect(geometry.option.end).toStrictEqual(11);
      expect(geometry.visibleGlyphs.length).toStrictEqual(10);
    });

    test('update without a text leaves the end index alone', async () => {
      const geometry = new TextGeometry('Hello World', { font: font, end: 5 });
      geometry.update();
      expect(geometry.option.end).toStrictEqual(5);
      expect(geometry.visibleGlyphs.length).toStrictEqual(5);
    });

    test('option setter replaces the whole option', async () => {
      const geometry = new TextGeometry('Hello World', { font: font, align: TextAlign.Right, letterSpacing: 8 });
      geometry.option = { font: font, letterSpacing: 4 };
      expect(geometry.option.letterSpacing).toStrictEqual(4);
      /** The fields the new option drops fall back to the defaults, exactly as in the constructor. */
      expect(geometry.option.align).toStrictEqual(TextAlign.Left);
      expect(geometry.option.flipY).toStrictEqual(true);
      expect(geometry.visibleGlyphs.length).toStrictEqual(10);
    });

    test('option setter applies the same defaults as the constructor', async () => {
      const text = 'Hello World';
      const geometry = new TextGeometry(text, { font: font, align: TextAlign.Right, letterSpacing: 8, width: 400, tabSize: 2, flipY: false, multipage: true });
      geometry.option = { font: font };
      const constructed = new TextGeometry(text, { font: font });
      expect(geometry.option).toStrictEqual(constructed.option);
      expect(geometry.attributes.uv?.array).toStrictEqual(constructed.attributes.uv?.array);
      expect(geometry.attributes.position?.array).toStrictEqual(constructed.attributes.position?.array);
    });

    test('update keeps the fields the option omits', async () => {
      const geometry = new TextGeometry('Hello World', { font: font, align: TextAlign.Right, letterSpacing: 8, tabSize: 2, flipY: false, multipage: true, mode: WordWrapMode.Pre, lineHeight: 42 });
      geometry.update('Howdy World', { font: font });
      expect(geometry.option.align).toStrictEqual(TextAlign.Right);
      expect(geometry.option.letterSpacing).toStrictEqual(8);
      expect(geometry.option.tabSize).toStrictEqual(2);
      expect(geometry.option.flipY).toStrictEqual(false);
      expect(geometry.option.multipage).toStrictEqual(true);
      expect(geometry.option.mode).toStrictEqual(WordWrapMode.Pre);
      expect(geometry.option.lineHeight).toStrictEqual(42);
      expect(geometry.text).toStrictEqual('Howdy World');
    });

    test('update takes width and mode and tolerates an option without a font', async () => {
      const geometry = new TextGeometry('this bitmap text is rendered with an OrthographicCamera', { font: font });
      geometry.update(undefined, { width: 400, mode: WordWrapMode.NoWrap });
      expect(geometry.option.font).toStrictEqual(font);
      expect(geometry.option.width).toStrictEqual(400);
      expect(geometry.option.mode).toStrictEqual(WordWrapMode.NoWrap);
      expect(geometry.visibleGlyphs.every((glyph) => glyph.line === 0)).toBe(true);
    });

    test('update takes every field the option carries', async () => {
      const geometry = new TextGeometry('Hello World', { font: font });
      const option = {
        font: font,
        start: 1,
        end: 9,
        width: 500,
        align: TextAlign.Center,
        mode: WordWrapMode.Pre,
        letterSpacing: 3,
        lineHeight: 50,
        tabSize: 2,
        flipY: false,
        multipage: true,
      };
      geometry.update('Howdy World', option);
      expect(geometry.option).toStrictEqual(option);
      expect(geometry.attributes.page).toBeDefined();
    });

    test('option setter without a font throws', async () => {
      const geometry = new TextGeometry('Hello World', { font: font });
      expect(() => {
        geometry.option = { letterSpacing: 4 };
      }).toThrow(new TypeError('Must specify a `font` in options'));
    });

    test('copy returns the target geometry', async () => {
      const source = new TextGeometry('Hello World', { font: font });
      const target = new TextGeometry('Hello Universe', { font: font });
      expect(target.copy(source)).toBe(target);
    });

    test('copy reproduces the text, the options and the geometry', async () => {
      const source = new TextGeometry('Hello World', { font: font, align: TextAlign.Right, letterSpacing: 2, width: 400 });
      const target = new TextGeometry('Hello Universe', { font: font });
      target.copy(source);
      expect(target.text).toStrictEqual('Hello World');
      expect(target.option).toStrictEqual(source.option);
      expect(target.visibleGlyphs.length).toStrictEqual(source.visibleGlyphs.length);
      expect(target.attributes.position?.array).toStrictEqual(source.attributes.position?.array);
      expect(target.attributes.uv?.array).toStrictEqual(source.attributes.uv?.array);
    });

    test('copy leaves the source untouched', async () => {
      const source = new TextGeometry('Hello World', { font: font });
      const target = new TextGeometry('Hello Universe', { font: font });
      target.copy(source);
      target.text = 'Goodbye Wor';
      expect(source.text).toStrictEqual('Hello World');
      expect(source.visibleGlyphs.length).toStrictEqual(10);
    });
  });

  describe('Three.js', () => {
    test('Renderer should be exist', async () => {
      expect(renderer).not.toBeNull();
    });

    test('Toggling multipage adds and removes the page attribute', async () => {
      const ascii = fs.readFileSync('tests/fonts/Norwester-Multi-64.fnt').toString();
      const multiFont = new BMFontAsciiParser().parse(ascii);
      const text = 'This bitmap text';
      const geometry = new TextGeometry(text, { font: multiFont, multipage: true });
      expect(geometry.attributes.page).toBeDefined();
      geometry.update(text, { font: multiFont, multipage: false });
      expect(geometry.attributes.page).toBeUndefined();
      geometry.update(text, { font: multiFont, multipage: true });
      expect(geometry.attributes.page).toBeDefined();
    });

    test('Empty text yields an empty bounding box and sphere', async () => {
      const geometry = new TextGeometry('', { font: font });
      expect(geometry.visibleGlyphs.length).toStrictEqual(0);
      geometry.computeBoundingBox();
      expect(geometry.boundingBox?.isEmpty()).toBe(true);
      geometry.computeBoundingSphere();
      expect(geometry.boundingSphere?.radius).toStrictEqual(0);
      expect(geometry.boundingSphere?.center.toArray()).toStrictEqual([0, 0, 0]);
    });

    test('Without a position attribute the bounds are left alone', async () => {
      const geometry = new TextGeometry('Hello World', { font: font });
      geometry.deleteAttribute('position');
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      expect(geometry.boundingBox?.isEmpty()).toBe(true);
      expect(geometry.boundingSphere?.radius).toStrictEqual(-1);
    });

    test('NaN positions report a NaN radius', async () => {
      const geometry = new TextGeometry('Hello World', { font: font });
      (geometry.attributes.position!.array as Float32Array)[0] = NaN;
      geometry.computeBoundingSphere();
      expect(geometry.boundingSphere?.radius).toBeNaN();
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Computed radius is NaN'));
    });

    test('Text Geometry', async () => {
      const text = 'this bitmap text\nis rendered with \nan OrthographicCamera';
      const geometry = new TextGeometry(text, {
        font: font,
      });
      expect(geometry.visibleGlyphs.length).toEqual(text.replace(/\n|\r|\n\r|\s/gi, '').length);
      expect(geometry.attributes.position?.array.length).toEqual(384);
    });

    test('Compute Bounding Box', async () => {
      /** Create geometry */
      const geometry = new TextGeometry('this bitmap text\nis rendered with \nan OrthographicCamera', {
        font: font,
      });
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load('tests/fonts/Roboto-Regular.png');
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        color: 0xaaffff,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      /** Render scene */
      renderer.render(scene, camera);
      /** Compute Bounding Box */
      expect(geometry.boundingBox).toBeNull();
      geometry.computeBoundingBox();
      expect(geometry.boundingBox).not.toBeNull();
      /** Update geometry */
      const prev = geometry.boundingBox?.clone();
      geometry.update('Hello Universe');
      geometry.computeBoundingBox();
      const curr = geometry.boundingBox?.clone();
      expect(prev).not.toBeNull();
      expect(prev).not.toStrictEqual(curr);
    });

    test('Compute Bounding Sphere', async () => {
      /** Create geometry */
      const geometry = new TextGeometry('this bitmap text\nis rendered with \nan OrthographicCamera', {
        font: font,
      });
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load('tests/fonts/Roboto-Regular.png');
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        color: 0xaaffff,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      /** Render scene */
      renderer.render(scene, camera);
      /** Compute Bounding Sphere */
      geometry.computeBoundingSphere();
      expect(geometry.boundingSphere).not.toBeNull();
      /** Update geometry */
      const prev = geometry.boundingSphere?.clone();
      geometry.update('Hello Universe');
      geometry.computeBoundingSphere();
      const curr = geometry.boundingSphere?.clone();
      expect(prev).not.toBeNull();
      expect(prev).not.toStrictEqual(curr);
    });

    test('Multiple textures', async () => {
      /** Load assets */
      const ascii = fs.readFileSync('tests/fonts/Norwester-Multi-64.fnt').toString();
      const font = new BMFontAsciiParser().parse(ascii);
      const textureLoader = new THREE.TextureLoader();
      const textures = [
        textureLoader.load('tests/fonts/Norwester-Multi_0.png'),
        textureLoader.load('tests/fonts/Norwester-Multi_1.png'),
        textureLoader.load('tests/fonts/Norwester-Multi_2.png'),
        textureLoader.load('tests/fonts/Norwester-Multi_3.png'),
      ];
      /** Material */
      const material = new MultiPageTextNodeMaterial({
        textures: textures,
        transparent: true,
        opacity: 0.95,
        color: new THREE.Color('rgb(230, 230, 230)'),
      });
      /** Geometry */
      const geometry = new TextGeometry('This bitmap text\nis rendered with \nan OrthographicCamera', {
        font: font,
        multipage: true,
        width: 700,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      /** Render scene */
      renderer.render(scene, camera);
      /** Compute Bounding Box */
      expect(geometry.boundingBox).toBeNull();
      geometry.computeBoundingBox();
      expect(geometry.boundingBox).not.toBeNull();
      /** Update geometry */
      const prev = geometry.boundingBox?.clone();
      geometry.update('Hello Universe');
      geometry.computeBoundingBox();
      const curr = geometry.boundingBox?.clone();
      expect(prev).not.toBeNull();
      expect(prev).not.toStrictEqual(curr);
    });
  });
});
