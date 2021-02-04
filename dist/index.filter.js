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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prettier_1 = __importDefault(require("prettier"));
const pascalcase_1 = __importDefault(require("pascalcase"));
const multimatch_1 = __importDefault(require("multimatch"));
const template_1 = require("./templates/template");
const utils_1 = require("./utils");
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
        if (allImport.includes(item.name)) {
            const text = options.modelMode === 'interface'
                ? template_1.interfaceTemplate(item.value.name, item.value.props, [], options.strictNullChecks)
                : template_1.classTemplate(item.value.name, item.value.props, [], options.strictNullChecks, options.useClassTransformer, options.generateValidationModel);
            defSource += text;
        }
    });
    allEnum.forEach(item => {
        if (allImport.includes(item.name)) {
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
        if (allImport.includes(item.name)) {
            const text = options.modelMode === 'interface'
                ? template_1.interfaceTemplate(item.value.name, item.value.props, [], options.strictNullChecks)
                : template_1.classTemplate(item.value.name, item.value.props, [], options.strictNullChecks, options.useClassTransformer, options.generateValidationModel);
            defSource += text;
        }
    });
    allEnum.forEach(item => {
        if (allImport.includes(item.name)) {
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
    console.log('filename', filename);
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
//# sourceMappingURL=index.filter.js.map