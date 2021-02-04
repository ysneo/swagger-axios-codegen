"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propTrueType = void 0;
const utils_1 = require("../utils");
function propTrueType(v) {
    let result = {
        propType: '',
        isEnum: false,
        isArray: false,
        /**ts type definition */
        isType: false,
        isUnionType: false,
        isCombinedType: false,
        ref: ''
    };
    if (v.$ref) {
        // 是引用类型
        result.propType = utils_1.refClassName(v.$ref || v.allOf[0].$ref);
        result.ref = result.propType;
    }
    //是个数组
    else if (v.items) {
        if (v.items.$ref) {
            // 是个引用类型
            result.ref = utils_1.refClassName(v.items.$ref);
            result.propType = result.ref + '[]';
        }
        else {
            if (v.type === "array" && v.items.oneOf && v.items.oneOf.length > 0) {
                result.isUnionType = true;
                result.propType = v.items.oneOf.map((type) => {
                    return utils_1.refClassName(type.$ref);
                }).join(',');
            }
            else if (v.type === "array" && v.items.allOf && v.items.allOf.length > 0) {
                result.isCombinedType = true;
                result.propType = v.items.allOf.map((type) => {
                    return utils_1.refClassName(type.$ref);
                }).join(',');
            }
            else if (v.items.type === "array") {
                const currentResult = propTrueType(v.items);
                result = Object.assign(Object.assign({}, result), currentResult);
            }
            else if (!!v.items.enum) {
                const currentResult = propTrueType(v.items);
                result = Object.assign(Object.assign({}, result), currentResult);
            }
            else {
                result.propType = utils_1.toBaseType(v.items.type) + '[]';
            }
        }
        result.isArray = true;
    }
    // 是枚举 并且是字符串类型
    else if (v.enum && v.type === 'string') {
        result.isEnum = true;
        result.propType = getEnums(v.enum)
            .map(item => isNaN(item)
            ? `'${item}'='${item}'`
            : `'KEY_${item}'='${item}'`)
            .join(',');
    }
    else if (v.enum) {
        result.isType = true;
        result.propType = v.type === 'string' ? getEnums(v.enum).map(item => `'${item}'`).join('|') : v.enum.join('|');
    }
    else if (v.oneOf && v.oneOf.length > 0) {
        result.isUnionType = true;
        result.propType = v.oneOf.map((type) => {
            return utils_1.refClassName(type.$ref);
        }).join(',');
    }
    else if (v.allOf && v.allOf) {
        result.isCombinedType = true;
        result.propType = v.allOf.map((type) => {
            return utils_1.refClassName(type.$ref);
        }).join(',');
    }
    // 基本类型
    else {
        result.propType = utils_1.toBaseType(v.type);
    }
    return result;
}
exports.propTrueType = propTrueType;
function getEnums(enumObject) {
    return Object.prototype.toString.call(enumObject) === '[object Object]' ? Object.values(enumObject) : enumObject;
}
//# sourceMappingURL=propTrueType.js.map