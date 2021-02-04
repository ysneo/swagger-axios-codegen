"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResponseType = void 0;
const utils_1 = require("../utils");
/**
 * 获取请求的返回类型
 */
function getResponseType(reqProps, isV3) {
    // It does not allow the schema defined directly, but only the primitive type is allowed.
    let result = 'any';
    let isRef = false;
    // 提取Schema
    const successStatusCode = Object.keys(reqProps.responses).find(statusCode => statusCode.match(/20[0-4]$/));
    if (!successStatusCode) {
        return { responseType: result, isRef };
    }
    let resSchema = null;
    if (reqProps.responses[successStatusCode]) {
        if (isV3 === true) {
            if (reqProps.responses[successStatusCode].content &&
                reqProps.responses[successStatusCode].content['application/json'] &&
                reqProps.responses[successStatusCode].content['application/json'].schema)
                resSchema = reqProps.responses[successStatusCode].content['application/json'].schema;
        }
        else {
            if (reqProps.responses[successStatusCode].schema)
                resSchema = reqProps.responses[successStatusCode].schema;
        }
    }
    if (!resSchema) {
        return { responseType: result, isRef };
    }
    // console.log(resSchema)
    let checkType = resSchema.type;
    let format = resSchema.format;
    // 如果是数组
    if (checkType === 'array' || resSchema.items) {
        if (resSchema.items.$ref) {
            const refType = utils_1.refClassName(resSchema.items.$ref);
            isRef = true;
            result = refType + '[]';
        }
        else {
            const refType = utils_1.toBaseType(resSchema.items.type, resSchema.items.format);
            result = refType + '[]';
        }
    }
    else if (resSchema.$ref) {
        // 如果是引用对象
        result = utils_1.refClassName(resSchema.$ref) || 'any';
        isRef = true;
    }
    else {
        result = checkType;
        result = utils_1.toBaseType(result, format);
    }
    if (result == 'object') {
        result = 'any';
    }
    else if (result == 'array') {
        result = 'any[]';
    }
    // else if (result == 'Result') {
    //   result = 'any'
    // }
    // console.log(result)
    return { responseType: result, isRef };
}
exports.getResponseType = getResponseType;
//# sourceMappingURL=getResponseType.js.map