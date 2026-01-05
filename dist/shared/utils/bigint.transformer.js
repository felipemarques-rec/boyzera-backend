"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigintToNumberTransformer = exports.bigintTransformer = void 0;
exports.bigintTransformer = {
    to: (value) => {
        if (value === null || value === undefined) {
            return '0';
        }
        return value.toString();
    },
    from: (value) => {
        if (value === null || value === undefined) {
            return BigInt(0);
        }
        return BigInt(value);
    },
};
exports.bigintToNumberTransformer = {
    to: (value) => {
        if (value === null || value === undefined) {
            return null;
        }
        return value.toString();
    },
    from: (value) => {
        if (value === null || value === undefined) {
            return 0;
        }
        return parseInt(value, 10);
    },
};
//# sourceMappingURL=bigint.transformer.js.map