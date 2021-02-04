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
Object.defineProperty(exports, "__esModule", { value: true });
exports.definitionHeader = exports.customerServiceHeader = exports.serviceHeader = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const genericTypeDefinitionTemplate_1 = require("./genericTypeDefinitionTemplate");
function serviceHeader(options) {
    const classTransformerImport = options.useClassTransformer
        ? `import { Expose, Transform, Type, plainToClass } from 'class-transformer';
  `
        : '';
    return `/** Generate by swagger-axios-codegen */
  // tslint:disable
  /* eslint-disable */
  import axiosStatic, { AxiosInstance } from 'axios';

  ${classTransformerImport}

  export interface IRequestOptions {
    headers?: any;
    baseURL?: string;
    responseType?: string;
  }

  export interface IRequestConfig {
    method?: any;
    headers?: any;
    url?: any;
    data?: any;
    params?: any;
  }

  // Add options interface
  export interface ServiceOptions {
    axios?: AxiosInstance,
  }

  ${requestHeader()}
  `;
}
exports.serviceHeader = serviceHeader;
function customerServiceHeader(options) {
    return `/** Generate by swagger-axios-codegen */
  // tslint:disable
  /* eslint-disable */
  export interface IRequestOptions {
    headers?: any;
  }

  export interface IRequestPromise<T=any> extends Promise<IRequestResponse<T>> {}

  export interface IRequestResponse<T=any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: any;
    request?: any;
  }

  export interface IRequestInstance {
    (config: any): IRequestPromise;
    (url: string, config?: any): IRequestPromise;
    request<T = any>(config: any): IRequestPromise<T>;
  }

  export interface IRequestConfig {
    method?: any;
    headers?: any;
    url?: any;
    data?: any;
    params?: any;
  }

  // Add options interface
  export interface ServiceOptions {
    axios?: IRequestInstance,
  }

  ${requestHeader()}

  `;
}
exports.customerServiceHeader = customerServiceHeader;
function requestHeader() {
    return `

  // Add default options
  export const serviceOptions: ServiceOptions = {
  };

  // Instance selector
  export function axios(configs: IRequestConfig, resolve: (p: any) => void, reject: (p: any) => void): Promise<any> {
    if (serviceOptions.axios) {
      return serviceOptions.axios.request(configs).then(res => {
        const data = res.data;
        if(data.code === 200) {
          resolve(data.data);
        } else {
          reject(data.msg);
        }
      })
        .catch(err => {
          reject(err);
        });
    } else {
      throw new Error('please inject yourself instance like axios  ')
    }
  }

  export function getConfigs(method: string, contentType: string, url: string,options: any):IRequestConfig {
    const configs: IRequestConfig = { ...options, method, url };
    configs.headers = {
      ...options.headers,
      'Content-Type': contentType,
    };
    return configs
  }
  `;
}
function definitionHeader(fileDir) {
    let fileStr = '// empty ';
    if (!!fileDir) {
        console.log('extendDefinitionFile url : ', path.resolve(fileDir));
        if (fs.existsSync(path.resolve(fileDir))) {
            const buffs = fs.readFileSync(path.resolve(fileDir));
            fileStr = buffs.toString('utf8');
        }
    }
    return `
  ${genericTypeDefinitionTemplate_1.universalGenericTypeDefinition()}
  ${genericTypeDefinitionTemplate_1.abpGenericTypeDefinition()}
  // customer definition
  ${fileStr}
  `;
}
exports.definitionHeader = definitionHeader;
//# sourceMappingURL=serviceHeader.js.map