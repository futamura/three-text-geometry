import Ajv, { ValidateFunction } from 'ajv';

import { BMFontError } from '../error/index.js';
import { BMFont, DefaultBMFont, DefaultBMFontCommon, DefaultBMFontDistanceField, DefaultBMFontInfo, IBMFontParser } from '../types/index.js';
import schema from './BMFontJsonSchema.js';

/**
 * # About the json schema
 * The schema was first generated from `src/types/BMFont.ts` with quicktype:
 * $ npm install -g quicktype
 * $ quicktype ./src/types/BMFont.ts -o ./src/parser/BMFontJsonSchema.json --lang schema
 *
 * It has since been edited by hand, so do not regenerate it. It also no longer lives in a `.json` file —
 * see the comment on `BMFontJsonSchema.ts` for why. The root `$ref` makes the validator check the
 * font at all, and `required` only lists the fields the layout and geometry read. Generators omit the rest
 * (msdf-bmfont-xml writes no `info.fixedHeight`/`outline`; JSON converted from `.fnt` has no `distanceField`
 * or `chars[].index`/`char`), and `parse` fills them with defaults.
 */
let ajv: Ajv | undefined;
let validate: ValidateFunction | undefined;

/**
 * The class for parsing font data in JSON format.
 *
 * @class BMFontJsonParser
 */
class BMFontJsonParser implements IBMFontParser<object | string> {
  /**
   * The function that parses font data from a JSON string or object.
   *
   * ```typescript
   * import { BMFontJsonParser } from 'three-text-geometry'
   *
   * const data: object | string = ...json data...
   * const parser = new BMFontJsonParser();
   * const font: BMFont = parser.parse(data)
   * ```
   *
   * @param {object | string} json  `object` or `string` that contains font data.
   * @returns {BMFont} Parsed data that conforms to the `BMFont` interface.
   * @memberof BMFontJsonParser
   */
  public parse(json: object | string): BMFont {
    let data: any;
    try {
      data = typeof json === 'string' ? JSON.parse(json) : json;
    } catch (error: any) {
      throw new BMFontError(error.message);
    }
    /** Compiled on first use, so importing the package does not pay for it. */
    ajv ??= new Ajv();
    validate ??= ajv.compile(schema);
    const valid: boolean = validate(data);
    if (!valid) throw new BMFontError(`Invalid json data: ${ajv.errorsText(validate.errors)}`);
    return {
      ...DefaultBMFont(),
      ...data,
      info: { ...DefaultBMFontInfo(), ...data.info },
      common: { ...DefaultBMFontCommon(), ...data.common },
      distanceField: { ...DefaultBMFontDistanceField(), ...data.distanceField },
    };
  }
}

export { BMFontJsonParser };
