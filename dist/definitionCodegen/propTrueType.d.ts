import { IDefinitionProperty } from "../swaggerInterfaces";
export declare function propTrueType(v: IDefinitionProperty): {
    propType: string;
    isEnum: boolean;
    isArray: boolean;
    isType: boolean;
    ref: string;
};
