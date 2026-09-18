import * as THREE from 'three';

import { TextLayout } from './layout';
import { TextAlign, TextGeometryOption, TextGlyph } from './types';
import { computeBox, computeSphere, createIndices, extractPages, extractPositions, extractUVs } from './utils';

/**
 * The class that generates THREE.BufferGeometry from BMFont data.
 *
 * ```typescript
 * import * as THREE from 'three'
 * import TextGeometry from 'three-text-geometry'
 *
 * const text: string = '.....text to layout.....'
 * const option: TextGeometryOption = {
 *    font: font, // BMFont data
 * }
 * const geometry = new TextGeometry(text, option)
 * const material = new THREE.MeshBasicMaterial({
 *    map: texture, // THREE.Texture data
 *    side: THREE.DoubleSide,
 *    transparent: true,
 *    color: 0x666666,
 * })
 * const mesh = new THREE.Mesh(geometry, material)
 * ```
 *
 * @class TextGeometry
 * @augments {THREE.BufferGeometry}
 * @alpha
 */
class TextGeometry extends THREE.BufferGeometry {
  /**
   * The options that conform to TextGeometryOption.
   *
   * @type {TextGeometryOption}
   * @access private
   * @memberof TextGeometry
   */
  private _opt: TextGeometryOption = {
    font: undefined,
    start: undefined,
    end: undefined,
    width: undefined,
    mode: undefined,
    align: undefined,
    letterSpacing: undefined,
    lineHeight: undefined,
    tabSize: undefined,
    flipY: true,
    multipage: false,
  };

  private _text: string = '';

  private _visibleGlyphs: TextGlyph[] = [];

  /**
   * The options conforming to the TextGeometryOption interface.
   *
   * @type {TextGeometryOption}
   * @memberof textGeometry
   */
  public get option(): TextGeometryOption {
    return { ...this._opt } as TextGeometryOption;
  }

  /**
   * Sets the options for the text geometry.
   *
   * @param {TextGeometryOption} value - The options for the text geometry.
   */
  public set option(value: TextGeometryOption) {
    this.applyOption(value, 'option');
    this.update();
  }

  /**
   * The text to layout.
   *
   * @type {string}
   * @memberof TextGeometry
   */
  public get text(): string {
    return this._text;
  }

  /**
   * Sets the text to layout.
   *
   * @param {string} value - The text to layout.
   */
  public set text(value: string) {
    this.update(value);
  }

  /**
   * The array to store TextGlyph objects.
   *
   * @type {TextGlyph[]}
   * @memberof TextGeometry
   * @readonly
   */
  public get visibleGlyphs(): TextGlyph[] {
    return this._visibleGlyphs;
  }

  /**
   * The constructor to create an instance of TextGeometry.
   *
   * @param {string} text         Text to layout.
   * @param {TextGeometryOption} option - The options for the text geometry.
   * @memberof TextGeometry
   */
  constructor(text: string, option: TextGeometryOption = {}) {
    super();
    this._text = text;
    this.applyOption(option, 'constructor');
    this.update();
    // if (this.attributes.position) this.attributes.position.needsUpdate = true;
  }

  /**
   * The function to store a complete option, filling every field the caller omits with its default.
   *
   * This is what the constructor and the `option` setter share, so that setting `option` leaves the
   * geometry in the state constructing it with that option would. `update()` keeps its own partial
   * semantics, where an omitted field carries the current value over.
   *
   * @param {TextGeometryOption} option - The options for the text geometry.
   * @param {string} caller - The accessor reported in the error log when no font is given.
   * @throws {TypeError} If the font is not specified in options.
   * @memberof TextGeometry
   */
  private applyOption(option: TextGeometryOption, caller: string) {
    if (option.font === undefined) {
      console.error(`[TextGeometry:${caller}]`, this._text?.substring(0, 30), option);
      throw new TypeError('Must specify a `font` in options');
    }
    this._opt.font = option.font;
    this._opt.start = option.start !== undefined ? Math.max(0, option.start) : 0;
    this._opt.end = option.end !== undefined ? option.end : this._text.length;
    this._opt.width = option.width !== undefined ? option.width : undefined;
    this._opt.align = option.align !== undefined ? option.align : TextAlign.Left;
    this._opt.mode = option.mode !== undefined ? option.mode : undefined;
    this._opt.letterSpacing = option.letterSpacing !== undefined ? option.letterSpacing : 0;
    this._opt.lineHeight = option.lineHeight !== undefined ? option.lineHeight : this._opt.font!.common.lineHeight;
    this._opt.tabSize = option.tabSize !== undefined ? option.tabSize : 4;
    this._opt.flipY = option.flipY !== undefined ? option.flipY : true;
    this._opt.multipage = option.multipage !== undefined ? option.multipage : false;
  }

  /**
   * The function to copy the source geometry.
   *
   * @param {TextGeometry} source - The source geometry.
   * @returns {TextGeometry} The copied geometry.
   * @memberof TextGeometry
   */
  public override copy(source: TextGeometry): this {
    super.copy(source);

    /** `source.text` is a string, so it is assigned as-is; spreading it would yield an index object. */
    this._text = source.text;
    this._opt = { ...source.option };
    this.update();

    return this;
  }

  /**
   * The function to update the text.
   *
   * The option is partial: a field the caller omits keeps the value the geometry already has,
   * unlike the constructor and the `option` setter, which fill an omitted field with its default.
   * The fields derived from another are the exception. `end` comes from the text, so a call that
   * changes the text re-derives it, whether or not it passes an option; `lineHeight` comes from the
   * font, so a call that changes the font re-derives it unless it passes a `lineHeight` of its own.
   *
   * @param {string} text - The text to layout.
   * @param {TextGeometryOption} option - The options for the text geometry.
   * @memberof TextGeometry
   */
  public update(text?: string, option?: TextGeometryOption) {
    if (text !== undefined) this._text = text;
    if (option !== undefined) {
      const previousFont = this._opt.font;
      if (option.font !== undefined) this._opt.font = option.font;
      /** `lineHeight` defaults to the font's, so a new font brings its own unless one is given. */
      const fontChanged = this._opt.font !== previousFont;
      this._opt.start = option.start !== undefined ? Math.max(0, option.start) : 0;
      this._opt.end = option.end !== undefined ? option.end : this._text.length;
      this._opt.width = option.width !== undefined ? option.width : undefined;
      this._opt.align = option.align !== undefined ? option.align : this._opt.align;
      this._opt.mode = option.mode !== undefined ? option.mode : this._opt.mode;
      this._opt.letterSpacing = option.letterSpacing !== undefined ? option.letterSpacing : this._opt.letterSpacing;
      if (option.lineHeight !== undefined) this._opt.lineHeight = option.lineHeight;
      else if (fontChanged) this._opt.lineHeight = this._opt.font!.common.lineHeight;
      this._opt.tabSize = option.tabSize !== undefined ? option.tabSize : this._opt.tabSize;
      this._opt.flipY = option.flipY !== undefined ? option.flipY : this._opt.flipY;
      this._opt.multipage = option.multipage !== undefined ? option.multipage : this._opt.multipage;
    } else if (text !== undefined) {
      /** The text changed on its own, so `end` is re-derived the way passing an option would. */
      this._opt.end = this._text.length;
    }

    /** Determine texture size from font file */
    const texWidth = this._opt.font!.common.scaleW;
    const texHeight = this._opt.font!.common.scaleH;

    /** Get visible glyphs */
    const layout = new TextLayout(this._text, this._opt);
    const glyphs = layout.glyphs.filter((glyph) => {
      const bitmap = glyph.data;
      return bitmap.width * bitmap.height > 0;
    });

    /** Provide visible glyphs for convenience */
    this._visibleGlyphs = glyphs;

    /** Get common vertex data */
    const positions = extractPositions(glyphs);
    const uvs = extractUVs(glyphs, texWidth, texHeight, this._opt.flipY!);
    const indices = createIndices([], {
      clockwise: true,
      type: 'uint16',
      count: glyphs.length,
    });

    /** Update vertex data */
    this.setIndex(indices as number[]);
    this.setAttribute('position', new THREE.BufferAttribute(positions, 2));
    this.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    /** Update multipage data */
    if (!this._opt.multipage && 'page' in this.attributes) {
      /** Disable multipage rendering */
      this.deleteAttribute('page');
    } else if (this._opt.multipage) {
      /** Enable multipage rendering */
      this.setAttribute('page', new THREE.BufferAttribute(extractPages(glyphs), 1));
    }
  }

  /**
   * The function that computes the bounding sphere of the geometry.
   *
   * @memberof TextGeometry
   */
  public override computeBoundingSphere() {
    if (this.boundingSphere === null) this.boundingSphere = new THREE.Sphere();
    if (!this.attributes.position) return;
    this.attributes.position.needsUpdate = true;
    const positions = this.attributes.position.array;
    const itemSize = this.attributes.position.itemSize;
    if (!positions || !itemSize || positions.length < 2) {
      this.boundingSphere.radius = 0;
      this.boundingSphere.center.set(0, 0, 0);
      return;
    }
    computeSphere(positions, this.boundingSphere);
    if (isNaN(this.boundingSphere.radius)) {
      console.error('THREE.BufferGeometry.computeBoundingSphere(): ' + 'Computed radius is NaN. The ' + '"position" attribute is likely to have NaN values.');
    }
  }

  /**
   * The function that computes the bounding box of the geometry.
   *
   * @memberof TextGeometry
   */
  public override computeBoundingBox() {
    if (this.boundingBox === null) this.boundingBox = new THREE.Box3();
    const bbox = this.boundingBox;
    if (!this.attributes.position) return;
    this.attributes.position.needsUpdate = true;
    const positions = this.attributes.position.array;
    const itemSize = this.attributes.position.itemSize;
    if (!positions || !itemSize || positions.length < 2) {
      bbox.makeEmpty();
      return;
    }
    computeBox(positions, bbox);
  }
}

export default TextGeometry;
