import { IRequestMethod } from '../swaggerInterfaces';
export declare function getContentType(reqProps: IRequestMethod, isV3: boolean): "multipart/form-data" | "application/json";
