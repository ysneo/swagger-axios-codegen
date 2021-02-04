"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.codegen = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prettier_1 = __importDefault(require("prettier"));
const axios_1 = __importDefault(require("axios"));
const pascalcase_1 = __importDefault(require("pascalcase"));
const multimatch_1 = __importDefault(require("multimatch"));
const template_1 = require("./templates/template");
const serviceHeader_1 = require("./templates/serviceHeader");
const utils_1 = require("./utils");
const requestCodegen_1 = require("./requestCodegen");
const componentsCodegen_1 = require("./componentsCodegen");
const definitionCodegen_1 = require("./definitionCodegen");
const defaultOptions = {
    serviceNameSuffix: 'Service',
    enumNamePrefix: 'Enum',
    methodNameMode: 'operationId',
    outputDir: './service',
    fileName: 'index.ts',
    useStaticMethod: true,
    useCustomerRequestInstance: false,
    modelMode: 'interface',
    include: [],
    includeTypes: [],
    strictNullChecks: true,
    useClassTransformer: false,
    extendGenericType: [],
    multipleFileMode: false,
    sharedServiceOptions: false,
    useHeaderParameters: false
};
/** main */
function codegen(params) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        console.time('finish');
        let err;
        let swaggerSource;
        utils_1.setDefinedGenericTypes(params.extendGenericType);
        // 获取接口定义文件
        if (params.remoteUrl) {
            const { data: swaggerJson } = yield axios_1.default({ url: params.remoteUrl, responseType: 'text' });
            if (Object.prototype.toString.call(swaggerJson) === '[object String]') {
                fs.writeFileSync('./cache_swagger.json', swaggerJson);
                swaggerSource = require(path.resolve('./cache_swagger.json'));
            }
            else {
                swaggerSource = swaggerJson;
            }
        }
        else if (params.source) {
            swaggerSource = params.source;
        }
        else {
            throw new Error('remoteUrl or source must have a value');
        }
        const options = Object.assign(Object.assign({}, defaultOptions), params);
        let apiSource = '';
        let serviceHeaderSource = options.useCustomerRequestInstance ? serviceHeader_1.customerServiceHeader(options) : serviceHeader_1.serviceHeader(options);
        if (options.sharedServiceOptions) {
            writeFile(options.outputDir || '', 'serviceOptions.ts' || '', format(serviceHeaderSource, options));
            apiSource += `import { IRequestOptions, IRequestConfig, getConfigs, axios } from "./serviceOptions";`;
        }
        else {
            apiSource += serviceHeaderSource;
        }
        apiSource += `const basePath = '${utils_1.trimString(swaggerSource.basePath, '/', 'right')}'`;
        apiSource += serviceHeader_1.definitionHeader(options.extendDefinitionFile);
        // 判断是否是openApi3.0或者swagger3.0
        const isV3 = utils_1.isOpenApi3(params.openApi || swaggerSource.openapi || swaggerSource.swagger);
        // TODO: use filter plugin
        // 根据url过滤
        let paths = swaggerSource.paths;
        if (((_a = options.urlFilters) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            paths = {};
            Object.keys(swaggerSource.paths).forEach(path => {
                if (options.urlFilters.some(urlFilter => urlFilter.indexOf(path) > -1)) {
                    paths[path] = swaggerSource.paths[path];
                }
            });
        }
        let requestClass = requestCodegen_1.requestCodegen(paths, isV3, options);
        // let requestClasses = Object.entries(requestCodegen(swaggerSource.paths, isV3, options))
        const { models, enums } = isV3
            ? componentsCodegen_1.componentsCodegen(swaggerSource.components)
            : definitionCodegen_1.definitionsCodeGen(swaggerSource.definitions);
        let _allModel = Object.values(models);
        let _allEnum = Object.values(enums);
        // TODO: next next next time
        if (options.multipleFileMode) {
            // if (true) {
            Object.entries(requestCodegen_1.requestCodegen(swaggerSource.paths, isV3, options)).forEach(([className, requests]) => {
                let text = '';
                let allImport = [];
                requests.forEach(req => {
                    const reqName = options.methodNameMode == 'operationId' ? req.operationId : req.name;
                    if ('register' === reqName) {
                        console.log('req.requestSchema.parsedParameters.imports', JSON.stringify(req.requestSchema.parsedParameters.imports));
                    }
                    text += template_1.requestTemplate(reqName, req.requestSchema, options, _allModel);
                    let imports = utils_1.findDeepRefs(req.requestSchema.parsedParameters.imports, _allModel, _allEnum);
                    allImport = allImport.concat(imports);
                });
                // unique import
                const uniqueImports = [];
                allImport.push(...utils_1.getDefinedGenericTypes(), 'IRequestOptions', 'IRequestConfig', 'getConfigs', 'axios');
                for (const item of allImport) {
                    if (!uniqueImports.includes(item))
                        uniqueImports.push(item);
                }
                text = template_1.serviceTemplate(className + options.serviceNameSuffix, text, uniqueImports);
                writeFile(options.outputDir || '', className + 'Service.ts', format(text, options));
            });
            let defsString = '';
            Object.values(models).forEach(item => {
                const text = params.modelMode === 'interface'
                    ? template_1.interfaceTemplate(item.value.name, item.value.props, [], params.strictNullChecks)
                    : template_1.classTemplate(item.value.name, item.value.props, [], params.strictNullChecks, options.useClassTransformer, options.generateValidationModel);
                // const fileDir = path.join(options.outputDir || '', 'definitions')
                // writeFile(fileDir, item.name + '.ts', format(text, options))
                defsString += text;
            });
            Object.values(enums).forEach(item => {
                // const text = item.value ? enumTemplate(item.value.name, item.value.enumProps, 'Enum') : item.content || ''
                let text = '';
                if (item.value) {
                    if (item.value.type == 'string') {
                        text = template_1.enumTemplate(item.value.name, item.value.enumProps, options.enumNamePrefix);
                    }
                    else {
                        text = template_1.typeTemplate(item.value.name, item.value.enumProps, options.enumNamePrefix);
                    }
                }
                else {
                    text = item.content || '';
                }
                defsString += text;
            });
            defsString = apiSource + defsString;
            writeFile(options.outputDir || '', 'index.defs.ts', format(defsString, options));
        }
        else if (options.include && options.include.length > 0) {
            // TODO: use filter plugin
            // codegenInclude(apiSource, options, requestClass, models, enums)
            codegenMultimatchInclude(apiSource, options, requestClass, models, enums);
        }
        else {
            codegenAll(apiSource, options, requestClass, models, enums);
        }
        if (fs.existsSync('./cache_swagger.json')) {
            fs.unlinkSync('./cache_swagger.json');
        }
        console.timeEnd('finish');
        if (err) {
            throw err;
        }
    });
}
exports.codegen = codegen;
/** codegenAll */
function codegenAll(apiSource, options, requestClass, models, enums) {
    let requestClasses = Object.entries(requestClass);
    // 常规入口
    try {
        // 处理接口
        requestClasses.forEach(([className, requests]) => {
            let text = '';
            requests.forEach(req => {
                const reqName = options.methodNameMode == 'operationId' ? req.operationId : req.name;
                text += template_1.requestTemplate(reqName, req.requestSchema, options, Object.values(models));
            });
            text = template_1.serviceTemplate(className + options.serviceNameSuffix, text);
            apiSource += text;
        });
        // 处理类和枚举
        Object.values(models).forEach(item => {
            const text = options.modelMode === 'interface'
                ? template_1.interfaceTemplate(item.value.name, item.value.props, [], options.strictNullChecks)
                : template_1.classTemplate(item.value.name, item.value.props, [], options.strictNullChecks, options.useClassTransformer, options.generateValidationModel);
            apiSource += text;
        });
        Object.values(enums).forEach(item => {
            let text = '';
            if (item.value) {
                if (item.value.type == 'string') {
                    text = template_1.enumTemplate(item.value.name, item.value.enumProps, options.enumNamePrefix);
                }
                else {
                    text = template_1.typeTemplate(item.value.name, item.value.enumProps, options.enumNamePrefix);
                }
            }
            else {
                text = item.content || '';
            }
            apiSource += text;
        });
        writeFile(options.outputDir || '', options.fileName || '', format(apiSource, options));
    }
    catch (error) {
        console.log('error', error);
        throw error;
    }
}
// last include codegen
function codegenInclude(apiSource, options, requestClass, models, enums) {
    let requestClasses = Object.entries(requestClass);
    // 接口过滤入口
    let reqSource = '';
    let defSource = '';
    let allModel = Object.values(models);
    // console.log(allModel)
    let allEnum = Object.values(enums);
    let allImport = [];
    // 处理接口
    options.include.forEach(item => {
        let includeClassName = '';
        let includeRequests = null;
        if (Object.prototype.toString.call(item) === '[object String]') {
            includeClassName = item;
        }
        else {
            for (let k of Object.keys(item)) {
                includeClassName = k;
                includeRequests = item[k];
            }
        }
        for (let [className, requests] of requestClasses) {
            if (pascalcase_1.default(includeClassName) !== className)
                continue;
            let text = '';
            for (let req of requests) {
                const reqName = options.methodNameMode == 'operationId' ? req.operationId : req.name;
                if (includeRequests) {
                    if (includeRequests.includes(reqName)) {
                        text += template_1.requestTemplate(reqName, req.requestSchema, options, allModel);
                        // generate ref definition model
                        let imports = utils_1.findDeepRefs(req.requestSchema.parsedParameters.imports, allModel, allEnum);
                        allImport = allImport.concat(imports);
                    }
                }
                else {
                    text += template_1.requestTemplate(reqName, req.requestSchema, options, allModel);
                    let imports = utils_1.findDeepRefs(req.requestSchema.parsedParameters.imports, allModel, allEnum);
                    allImport = allImport.concat(imports);
                }
            }
            text = template_1.serviceTemplate(className + options.serviceNameSuffix, text);
            reqSource += text;
        }
    });
    // 处理类和枚举
    allModel.forEach(item => {
        if (allImport.includes(item.name) || options.includeTypes.includes(item.name)) {
            const text = options.modelMode === 'interface'
                ? template_1.interfaceTemplate(item.value.name, item.value.props, [], options.strictNullChecks)
                : template_1.classTemplate(item.value.name, item.value.props, [], options.strictNullChecks, options.useClassTransformer, options.generateValidationModel);
            defSource += text;
        }
    });
    allEnum.forEach(item => {
        if (allImport.includes(item.name) || options.includeTypes.includes(item.name)) {
            let text = '';
            if (item.value) {
                if (item.value.type == 'string') {
                    text = template_1.enumTemplate(item.value.name, item.value.enumProps, options.enumNamePrefix);
                }
                else {
                    text = template_1.typeTemplate(item.value.name, item.value.enumProps, options.enumNamePrefix);
                }
            }
            else {
                text = item.content || '';
            }
            defSource += text;
        }
    });
    apiSource += reqSource + defSource;
    writeFile(options.outputDir || '', options.fileName || '', format(apiSource, options));
}
/** current multimatch codegen */
function codegenMultimatchInclude(apiSource, options, requestClass, models, enums) {
    let requestClasses = Object.entries(requestClass);
    // 接口过滤入口
    let reqSource = '';
    let defSource = '';
    let allModel = Object.values(models);
    // console.log(allModel)
    let allEnum = Object.values(enums);
    let allImport = [];
    // #region 处理匹配集合
    const sourceClassNames = requestClasses.map(v => {
        const className = v[0];
        return className;
    });
    const includeRules = {};
    options.include.forEach(classNameFilter => {
        // *,?,**,{},!,
        // NOTICE: 目前要求 className 严格按照pascalcase书写
        if (typeof classNameFilter === 'string') {
            if (includeRules[classNameFilter] === undefined) {
                includeRules[classNameFilter] = new Set();
            }
            includeRules[classNameFilter].add('*');
        }
        else {
            Object.keys(classNameFilter).forEach(key => {
                if (includeRules[key] === undefined) {
                    includeRules[key] = new Set();
                }
                classNameFilter[key].forEach(requestFilter => includeRules[key].add(requestFilter));
            });
        }
    });
    // console.log('rules', includeRules)
    const matchedClassNames = multimatch_1.default(sourceClassNames, Object.keys(includeRules));
    // console.log('sourceClassNames', sourceClassNames)
    // console.log('matchedClassNames', matchedClassNames)
    // {tagNames:[...requestFilters]}
    const requiredClassNameMap = {};
    Object.keys(includeRules).forEach(classNameFilter => {
        // matched tagnames
        const requiredClassNames = multimatch_1.default(matchedClassNames, classNameFilter);
        requiredClassNames.forEach(className => {
            if (requiredClassNameMap[className] === undefined) {
                requiredClassNameMap[className] = new Set();
            }
            includeRules[classNameFilter].forEach(requestFilter => requiredClassNameMap[className].add(requestFilter));
        });
    });
    // console.log('className->requestRules', requiredClassNameMap)
    // #endregion
    // 处理接口
    requestClasses.forEach(([className, requests]) => {
        const includeRequestsFilters = requiredClassNameMap[className];
        if (includeRequestsFilters) {
            let text = '';
            const requestKeyMap = {};
            const requestKeys = requests.map(v => {
                const reqName = options.methodNameMode == 'operationId' ? v.operationId : v.name;
                requestKeyMap[reqName] = v;
                return reqName;
            });
            const requsetRules = Array.from(includeRequestsFilters);
            const requiredRequestKeys = multimatch_1.default(requestKeys, Array.from(requsetRules));
            // console.log(`${className}-methods-requsetRules`, requsetRules)
            // console.log(`${className}-methods-all`, requestKeys)
            // console.log(`${className}-methods-matched`, requiredRequestKeys)
            requiredRequestKeys.forEach(reqName => {
                const req = requestKeyMap[reqName];
                text += template_1.requestTemplate(reqName, req.requestSchema, options, allModel);
                // generate ref definition model
                // console.log(`${reqName}-imports`, req.requestSchema.parsedParameters.imports)
                let imports = utils_1.findDeepRefs(req.requestSchema.parsedParameters.imports, allModel, allEnum);
                allImport = allImport.concat(imports);
            });
            text = template_1.serviceTemplate(className + options.serviceNameSuffix, text);
            apiSource += text;
        }
    });
    // console.log(`allModel`, Object.keys(models))
    // console.log(`allImport`, allImport)
    // console.log(`allEnum`, Object.keys(enums))
    // 处理类和枚举
    allModel.forEach(item => {
        if (allImport.includes(item.name) || options.includeTypes.includes(item.name)) {
            const text = options.modelMode === 'interface'
                ? template_1.interfaceTemplate(item.value.name, item.value.props, [], options.strictNullChecks)
                : template_1.classTemplate(item.value.name, item.value.props, [], options.strictNullChecks, options.useClassTransformer, options.generateValidationModel);
            defSource += text;
        }
    });
    allEnum.forEach(item => {
        if (allImport.includes(item.name) || options.includeTypes.includes(item.name)) {
            let text = '';
            if (item.value) {
                if (item.value.type == 'string') {
                    text = template_1.enumTemplate(item.value.name, item.value.enumProps, options.enumNamePrefix);
                }
                else {
                    text = template_1.typeTemplate(item.value.name, item.value.enumProps, options.enumNamePrefix);
                }
            }
            else {
                text = item.content || '';
            }
            defSource += text;
        }
    });
    apiSource += reqSource + defSource;
    writeFile(options.outputDir || '', options.fileName || '', format(apiSource, options));
}
function writeFile(fileDir, name, data) {
    if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir);
    }
    const filename = path.join(fileDir, name);
    // console.log('filename', filename)
    fs.writeFileSync(filename, data);
}
function format(text, options) {
    if (options.format) {
        // console.log('use custom formatter')
        return options.format(text);
    }
    // console.log('use default formatter')
    return prettier_1.default.format(text, {
        printWidth: 120,
        tabWidth: 2,
        parser: 'typescript',
        trailingComma: 'none',
        jsxBracketSameLine: false,
        semi: true,
        singleQuote: true
    });
    // return text
}
//# sourceMappingURL=index.js.map