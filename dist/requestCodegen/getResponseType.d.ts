import { IRequestMethod } from '../swaggerInterfaces';
/**
 * 获取请求的返回类型
 */
export declare function getResponseType(reqProps: IRequestMethod, isV3: boolean): {
    responseType: string;
    isRef: boolean;
};
