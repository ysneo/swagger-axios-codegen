"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapFormDataToV2 = void 0;
function getType(param) {
    if (param.format === 'binary') {
        return 'file';
    }
    return param.type;
}
function mapFormDataToV2(schema) {
    const properties = schema === null || schema === void 0 ? void 0 : schema.properties;
    if (!properties) {
        return [];
    }
    return Object.keys(properties).map(p => ({
        in: 'formData',
        name: p,
        description: '',
        required: 'true',
        items: properties[p].items,
        schema: {
            $ref: null,
            type: getType(properties[p])
        },
        type: properties[p].type,
        format: getType(properties[p])
    }));
}
exports.mapFormDataToV2 = mapFormDataToV2;
//# sourceMappingURL=mapFormDataToV2.js.map