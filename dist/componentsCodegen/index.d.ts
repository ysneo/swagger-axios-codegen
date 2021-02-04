import { IComponents } from '../swaggerInterfaces';
import { IDefinitionClasses, IDefinitionEnums } from '../baseInterfaces';
export declare function componentsCodegen(definitions: IComponents): {
    models: IDefinitionClasses;
    enums: IDefinitionEnums;
};
