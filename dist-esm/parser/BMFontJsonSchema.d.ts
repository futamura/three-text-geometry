declare const BMFontJsonSchema: {
    $schema: string;
    $ref: string;
    definitions: {
        BMFont: {
            title: string;
            type: string;
            properties: {
                pages: {
                    type: string;
                    items: {
                        type: string;
                    };
                    title: string;
                };
                chars: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    title: string;
                };
                info: {
                    $ref: string;
                    title: string;
                };
                common: {
                    $ref: string;
                    title: string;
                };
                distanceField: {
                    $ref: string;
                    title: string;
                };
                kernings: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    title: string;
                };
            };
            required: string[];
        };
        BMFontChar: {
            title: string;
            type: string;
            properties: {
                id: {
                    type: string;
                    title: string;
                };
                index: {
                    type: string;
                    title: string;
                };
                char: {
                    type: string;
                    title: string;
                };
                width: {
                    type: string;
                    title: string;
                };
                height: {
                    type: string;
                    title: string;
                };
                xoffset: {
                    type: string;
                    title: string;
                };
                yoffset: {
                    type: string;
                    title: string;
                };
                xadvance: {
                    type: string;
                    title: string;
                };
                chnl: {
                    type: string;
                    title: string;
                };
                x: {
                    type: string;
                    title: string;
                };
                y: {
                    type: string;
                    title: string;
                };
                page: {
                    type: string;
                    title: string;
                };
            };
            required: string[];
        };
        BMFontInfo: {
            title: string;
            type: string;
            properties: {
                face: {
                    type: string;
                    title: string;
                };
                size: {
                    type: string;
                    title: string;
                };
                bold: {
                    type: string;
                    title: string;
                };
                italic: {
                    type: string;
                    title: string;
                };
                charset: {
                    anyOf: ({
                        type: string;
                        items?: undefined;
                    } | {
                        type: string;
                        items: {
                            type: string;
                        };
                    })[];
                    title: string;
                };
                unicode: {
                    type: string;
                    title: string;
                };
                stretchH: {
                    type: string;
                    title: string;
                };
                smooth: {
                    type: string;
                    title: string;
                };
                aa: {
                    type: string;
                    title: string;
                };
                padding: {
                    type: string;
                    items: {
                        type: string;
                    };
                    title: string;
                };
                spacing: {
                    type: string;
                    items: {
                        type: string;
                    };
                    title: string;
                };
                fixedHeight: {
                    type: string;
                    title: string;
                };
                outline: {
                    type: string;
                    title: string;
                };
            };
        };
        BMFontCommon: {
            title: string;
            type: string;
            properties: {
                lineHeight: {
                    type: string;
                    title: string;
                };
                base: {
                    type: string;
                    title: string;
                };
                scaleW: {
                    type: string;
                    title: string;
                };
                scaleH: {
                    type: string;
                    title: string;
                };
                pages: {
                    type: string;
                    title: string;
                };
                packed: {
                    type: string;
                    title: string;
                };
                alphaChnl: {
                    type: string;
                    title: string;
                };
                redChnl: {
                    type: string;
                    title: string;
                };
                greenChnl: {
                    type: string;
                    title: string;
                };
                blueChnl: {
                    type: string;
                    title: string;
                };
            };
            required: string[];
        };
        BMFontDistanceField: {
            title: string;
            type: string;
            properties: {
                fieldType: {
                    type: string;
                    title: string;
                };
                distanceRange: {
                    type: string;
                    title: string;
                };
            };
        };
        BMFontKern: {
            title: string;
            type: string;
            properties: {
                first: {
                    type: string;
                    title: string;
                };
                second: {
                    type: string;
                    title: string;
                };
                amount: {
                    type: string;
                    title: string;
                };
            };
            required: string[];
        };
    };
};
export default BMFontJsonSchema;
//# sourceMappingURL=BMFontJsonSchema.d.ts.map