import { IPaths } from '../swaggerInterfaces';
import { ISwaggerOptions } from '../baseInterfaces';
export interface IRequestClass {
    [key: string]: IRequestMethods[];
}
export interface IRequestMethods {
    name: string;
    operationId: string;
    requestSchema: any;
}
export declare function requestCodegen(paths: IPaths, isV3: boolean, options: ISwaggerOptions): IRequestClass;
