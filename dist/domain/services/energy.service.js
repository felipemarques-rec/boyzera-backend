"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergyService = void 0;
const common_1 = require("@nestjs/common");
let EnergyService = class EnergyService {
    calculateCurrentEnergy(user) {
        const now = new Date();
        const lastUpdate = user.lastEnergyUpdate || user.createdAt || now;
        const currentStoredEnergy = Number(user.energy) || 0;
        const maxEnergy = Number(user.maxEnergy) || 1000;
        const regenRate = Number(user.energyRegenRate) || 1;
        const lastUpdateTime = new Date(lastUpdate).getTime();
        const elapsedMs = now.getTime() - lastUpdateTime;
        const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
        const regenerated = Math.floor(elapsedSeconds * regenRate);
        const baseEnergy = Math.max(0, currentStoredEnergy);
        const newEnergy = Math.min(baseEnergy + regenerated, maxEnergy);
        const energyNeeded = maxEnergy - newEnergy;
        const secondsUntilFull = energyNeeded > 0 ? Math.ceil(energyNeeded / regenRate) : 0;
        return {
            currentEnergy: newEnergy,
            maxEnergy: maxEnergy,
            lastUpdate: now,
            secondsUntilFull,
        };
    }
    canTap(user, tapCount = 1) {
        const { currentEnergy } = this.calculateCurrentEnergy(user);
        return currentEnergy >= tapCount;
    }
    consumeEnergy(user, amount) {
        const { currentEnergy } = this.calculateCurrentEnergy(user);
        const newEnergy = Math.max(0, currentEnergy - amount);
        return {
            newEnergy,
            lastUpdate: new Date(),
        };
    }
    getRegenTimeForEnergy(user, energyNeeded) {
        const seconds = Math.ceil(energyNeeded / user.energyRegenRate);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        let readableTime = '';
        if (hours > 0)
            readableTime += `${hours}h `;
        if (minutes > 0)
            readableTime += `${minutes}m `;
        if (secs > 0 || readableTime === '')
            readableTime += `${secs}s`;
        return { seconds, readableTime: readableTime.trim() };
    }
};
exports.EnergyService = EnergyService;
exports.EnergyService = EnergyService = __decorate([
    (0, common_1.Injectable)()
], EnergyService);
//# sourceMappingURL=energy.service.js.map