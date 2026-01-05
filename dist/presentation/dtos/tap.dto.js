"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TapResponseDto = exports.BatchTapDto = void 0;
const class_validator_1 = require("class-validator");
class BatchTapDto {
    taps;
    timestamp;
    clientHash;
}
exports.BatchTapDto = BatchTapDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], BatchTapDto.prototype, "taps", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], BatchTapDto.prototype, "timestamp", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], BatchTapDto.prototype, "clientHash", void 0);
class TapResponseDto {
    success;
    tapsProcessed;
    followersEarned;
    totalFollowers;
    energy;
    maxEnergy;
    combo;
    comboMultiplier;
    levelUp;
}
exports.TapResponseDto = TapResponseDto;
//# sourceMappingURL=tap.dto.js.map