"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestCodegen = void 0;
const utils_1 = require("../utils");
const getRequestParameters_1 = require("./getRequestParameters");
const getResponseType_1 = require("./getResponseType");
const camelcase_1 = __importDefault(require("camelcase"));
const getRequestBody_1 = require("./getRequestBody");
const getContentType_1 = require("./getContentType");
const mapFormDataToV2_1 = require("./mapFormDataToV2");
function requestCodegen(paths, isV3, options) {
    var _a, _b, _c, _d;
    const requestClasses = {};
    if (!!paths)
        for (const [path, request] of Object.entries(paths)) {
            let methodName = utils_1.getMethodName(path);
            for (const [method, reqProps] of Object.entries(request)) {
                methodName =
                    options.methodNameMode === 'operationId'
                        ? reqProps.operationId
                        : options.methodNameMode === 'shortOperationId'
                            ? trimSuffix(reqProps.operationId, (_a = reqProps.tags) === null || _a === void 0 ? void 0 : _a[0])
                            : typeof options.methodNameMode === 'function'
                                ? options.methodNameMode(reqProps)
                                : methodName;
                if (!methodName) {
                    // console.warn('method Name is null：', path);
                    continue;
                }
                const contentType = getContentType_1.getContentType(reqProps, isV3);
                let formData = '';
                let pathReplace = '';
                // 获取类名
                if (!reqProps.tags)
                    continue;
                const className = camelcase_1.default(utils_1.RemoveSpecialCharacters(reqProps.tags[0]), { pascalCase: true });
                if (className === '')
                    continue;
                // 是否存在
                if (!requestClasses[className]) {
                    requestClasses[className] = [];
                }
                let parameters = '';
                let handleNullParameters = '';
                let parsedParameters = {
                    requestParameters: ''
                };
                const multipartDataProperties = (_b = reqProps === null || reqProps === void 0 ? void 0 : reqProps.requestBody) === null || _b === void 0 ? void 0 : _b.content['multipart/form-data'];
                if (reqProps.parameters || multipartDataProperties) {
                    // 获取到接口的参数
                    let tempParameters = reqProps.parameters || [];
                    // 合并两个参数类型
                    if (multipartDataProperties) {
                        tempParameters = tempParameters.concat(mapFormDataToV2_1.mapFormDataToV2(multipartDataProperties.schema));
                    }
                    parsedParameters = getRequestParameters_1.getRequestParameters(tempParameters, options.useHeaderParameters);
                    formData = parsedParameters.requestFormData
                        ? 'data = new FormData();\n' + parsedParameters.requestFormData
                        : '';
                    pathReplace = parsedParameters.requestPathReplace;
                }
                let imports = parsedParameters.imports || [];
                let parsedRequestBody = {};
                if (reqProps.requestBody) {
                    parsedRequestBody = getRequestBody_1.getRequestBody(reqProps.requestBody);
                    // 合并imports
                    if (((_c = parsedRequestBody.imports) === null || _c === void 0 ? void 0 : _c.length) >= 0) {
                        // console.log("requestBody ", parsedRequestBody);
                        imports.push(...parsedRequestBody.imports);
                    }
                    parsedParameters.requestParameters = parsedParameters.requestParameters
                        ? parsedParameters.requestParameters + parsedRequestBody.bodyType
                        : parsedRequestBody.bodyType;
                }
                parameters =
                    ((_d = parsedParameters.requestParameters) === null || _d === void 0 ? void 0 : _d.length) > 0
                        ? `params: {
              ${parsedParameters.requestParameters}
          } = {} as any,`
                        : '';
                const { responseType, isRef: refResponseType } = getResponseType_1.getResponseType(reqProps, isV3);
                // 如果返回值也是引用类型，则加入到类的引用里面
                // console.log('refResponseType', responseType, refResponseType)
                if (refResponseType) {
                    imports.push(responseType);
                }
                parsedParameters.imports = imports;
                // TODO 待优化，目前简单处理同名方法
                let uniqueMethodName = camelcase_1.default(methodName);
                var uniqueMethodNameReg = new RegExp(`^${uniqueMethodName}[0-9]*$`);
                const methodCount = requestClasses[className].filter(item => uniqueMethodName === item.name || uniqueMethodNameReg.test(item.name)).length;
                // console.log(uniqueMethodName, methodCount)
                if (methodCount >= 1) {
                    uniqueMethodName = uniqueMethodName + methodCount;
                    // console.log(uniqueMethodName)
                }
                requestClasses[className].push({
                    name: uniqueMethodName,
                    operationId: uniqueMethodName,
                    requestSchema: {
                        summary: reqProps.summary,
                        path,
                        pathReplace,
                        parameters,
                        parsedParameters,
                        method,
                        contentType,
                        responseType,
                        formData,
                        requestBody: parsedRequestBody.bodyType
                    }
                });
            }
        }
    return requestClasses;
}
exports.requestCodegen = requestCodegen;
function trimSuffix(value, suffix) {
    return (value === null || value === void 0 ? void 0 : value.endsWith(suffix)) ? value.slice(0, -suffix.length) : value;
}
//# sourceMappingURL=index.js.map