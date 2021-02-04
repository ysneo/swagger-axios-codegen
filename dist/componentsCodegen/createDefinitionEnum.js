"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefinitionEnum = void 0;
/**
 * 生成类定义
 * @param className class名称
 * @param enum 枚举列表
 * @param type 枚举的类型
 */
function createDefinitionEnum(className, enumArray, type) {
    const result = type === 'string'
        ? enumArray
            .map(item => isNaN(item)
            ? `'${item}'='${item}'`
            : `'KEY_${item}'='${item}'`)
            .join(',')
        : enumArray.join('|');
    return { name: className, enumProps: result, type: type };
}
exports.createDefinitionEnum = createDefinitionEnum;
//# sourceMappingURL=createDefinitionEnum.js.map