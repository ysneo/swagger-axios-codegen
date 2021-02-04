"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContentType = void 0;
function getContentType(reqProps, isV3) {
    var _a;
    if (isV3) {
        return ((_a = reqProps === null || reqProps === void 0 ? void 0 : reqProps.requestBody) === null || _a === void 0 ? void 0 : _a.content['multipart/form-data']) ? 'multipart/form-data' : 'application/json';
    }
    return reqProps.consumes && reqProps.consumes.includes('multipart/form-data')
        ? 'multipart/form-data'
        : 'application/json';
}
exports.getContentType = getContentType;
//# sourceMappingURL=getContentType.js.map