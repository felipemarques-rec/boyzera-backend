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
exports.PassiveIncomeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let PassiveIncomeService = class PassiveIncomeService {
    configService;
    maxOfflineHours;
    constructor(configService) {
        this.configService = configService;
        this.maxOfflineHours = this.configService.get('OFFLINE_MAX_HOURS', 3);
    }
    calculatePassiveIncome(user) {
        if (user.profitPerHour <= 0) {
            return {
                earnedFollowers: BigInt(0),
                hoursOffline: 0,
                cappedHours: 0,
                wasCollected: false,
            };
        }
        const now = new Date();
        const lastLogin = user.lastLoginAt || user.createdAt;
        const hoursOffline = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
        const cappedHours = Math.min(hoursOffline, this.maxOfflineHours);
        const earnedFollowers = BigInt(Math.floor(cappedHours * user.profitPerHour));
        return {
            earnedFollowers,
            hoursOffline,
            cappedHours,
            wasCollected: earnedFollowers > 0n,
        };
    }
    getPotentialEarnings(user, hours) {
        if (user.profitPerHour <= 0) {
            return BigInt(0);
        }
        const cappedHours = Math.min(hours, this.maxOfflineHours);
        return BigInt(Math.floor(cappedHours * user.profitPerHour));
    }
    getMaxOfflineHours() {
        return this.maxOfflineHours;
    }
    getHourlyRate(user) {
        return user.profitPerHour;
    }
    formatEarnings(followers) {
        const num = Number(followers);
        if (num >= 1_000_000_000) {
            return `${(num / 1_000_000_000).toFixed(1)}B`;
        }
        if (num >= 1_000_000) {
            return `${(num / 1_000_000).toFixed(1)}M`;
        }
        if (num >= 1_000) {
            return `${(num / 1_000).toFixed(1)}K`;
        }
        return num.toString();
    }
};
exports.PassiveIncomeService = PassiveIncomeService;
exports.PassiveIncomeService = PassiveIncomeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PassiveIncomeService);
//# sourceMappingURL=passive-income.service.js.map