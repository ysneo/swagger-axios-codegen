import { IDefinitions } from '../swaggerInterfaces';
import { IDefinitionClasses, IDefinitionEnums } from '../baseInterfaces';
export declare function definitionsCodeGen(definitions: IDefinitions): {
    models: IDefinitionClasses;
    enums: IDefinitionEnums;
};
