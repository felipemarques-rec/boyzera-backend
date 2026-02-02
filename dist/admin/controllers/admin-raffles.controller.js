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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRafflesController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const admin_auth_guard_1 = require("../guards/admin-auth.guard");
const raffle_entity_1 = require("../../domain/entities/raffle.entity");
const raffle_task_entity_1 = require("../../domain/entities/raffle-task.entity");
const raffle_ticket_entity_1 = require("../../domain/entities/raffle-ticket.entity");
let AdminRafflesController = class AdminRafflesController {
    raffleRepository;
    taskRepository;
    ticketRepository;
    constructor(raffleRepository, taskRepository, ticketRepository) {
        this.raffleRepository = raffleRepository;
        this.taskRepository = taskRepository;
        this.ticketRepository = ticketRepository;
    }
    async getRaffles() {
        return this.raffleRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async getRaffle(id) {
        return this.raffleRepository.findOne({
            where: { id },
            relations: ['tasks', 'tickets'],
        });
    }
    async createRaffle(data) {
        const raffle = this.raffleRepository.create(data);
        return this.raffleRepository.save(raffle);
    }
    async updateRaffle(id, data) {
        await this.raffleRepository.update(id, data);
        return this.raffleRepository.findOne({ where: { id } });
    }
    async deleteRaffle(id) {
        await this.raffleRepository.delete(id);
        return { success: true };
    }
    async getTasks(raffleId) {
        return this.taskRepository.find({
            where: { raffleId },
            order: { sortOrder: 'ASC' },
        });
    }
    async createTask(raffleId, data) {
        const task = this.taskRepository.create({ ...data, raffleId });
        return this.taskRepository.save(task);
    }
    async updateTask(taskId, data) {
        await this.taskRepository.update(taskId, data);
        return this.taskRepository.findOne({ where: { id: taskId } });
    }
    async deleteTask(taskId) {
        await this.taskRepository.delete(taskId);
        return { success: true };
    }
    async drawWinner(id) {
        const raffle = await this.raffleRepository.findOne({ where: { id } });
        if (!raffle) {
            throw new Error('Raffle not found');
        }
        if (raffle.status !== raffle_entity_1.RaffleStatus.ACTIVE) {
            throw new Error('Raffle is not active');
        }
        const tickets = await this.ticketRepository.find({
            where: { raffleId: id },
        });
        if (tickets.length === 0) {
            throw new Error('No tickets in this raffle');
        }
        const winners = [];
        const availableTickets = [...tickets];
        for (let i = 0; i < raffle.numberOfWinners && availableTickets.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableTickets.length);
            const winnerTicket = availableTickets.splice(randomIndex, 1)[0];
            winnerTicket.isWinner = true;
            winnerTicket.wonAt = new Date();
            winners.push(winnerTicket);
        }
        await this.ticketRepository.save(winners);
        raffle.status = raffle_entity_1.RaffleStatus.COMPLETED;
        raffle.winnerIds = winners.map((t) => t.userId);
        await this.raffleRepository.save(raffle);
        return {
            success: true,
            winners: winners.map((t) => ({
                ticketNumber: t.ticketNumber,
                userId: t.userId,
            })),
        };
    }
    async getRaffleStats(id) {
        const totalTickets = await this.ticketRepository.count({ where: { raffleId: id } });
        const uniqueParticipants = await this.ticketRepository
            .createQueryBuilder('ticket')
            .where('ticket.raffleId = :id', { id })
            .select('COUNT(DISTINCT ticket.userId)', 'count')
            .getRawOne();
        return {
            totalTickets,
            uniqueParticipants: parseInt(uniqueParticipants?.count || '0', 10),
        };
    }
};
exports.AdminRafflesController = AdminRafflesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminRafflesController.prototype, "getRaffles", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminRafflesController.prototype, "getRaffle", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminRafflesController.prototype, "createRaffle", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminRafflesController.prototype, "updateRaffle", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminRafflesController.prototype, "deleteRaffle", null);
__decorate([
    (0, common_1.Get)(':raffleId/tasks'),
    __param(0, (0, common_1.Param)('raffleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminRafflesController.prototype, "getTasks", null);
__decorate([
    (0, common_1.Post)(':raffleId/tasks'),
    __param(0, (0, common_1.Param)('raffleId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminRafflesController.prototype, "createTask", null);
__decorate([
    (0, common_1.Put)('tasks/:taskId'),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminRafflesController.prototype, "updateTask", null);
__decorate([
    (0, common_1.Delete)('tasks/:taskId'),
    __param(0, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminRafflesController.prototype, "deleteTask", null);
__decorate([
    (0, common_1.Post)(':id/draw'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminRafflesController.prototype, "drawWinner", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminRafflesController.prototype, "getRaffleStats", null);
exports.AdminRafflesController = AdminRafflesController = __decorate([
    (0, common_1.Controller)('admin/raffles'),
    (0, common_1.UseGuards)(admin_auth_guard_1.AdminAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(raffle_entity_1.Raffle)),
    __param(1, (0, typeorm_1.InjectRepository)(raffle_task_entity_1.RaffleTask)),
    __param(2, (0, typeorm_1.InjectRepository)(raffle_ticket_entity_1.RaffleTicket)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminRafflesController);
//# sourceMappingURL=admin-raffles.controller.js.map