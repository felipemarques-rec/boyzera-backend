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
exports.RaffleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../domain/entities/user.entity");
const raffle_entity_1 = require("../../domain/entities/raffle.entity");
const raffle_ticket_entity_1 = require("../../domain/entities/raffle-ticket.entity");
const raffle_task_entity_1 = require("../../domain/entities/raffle-task.entity");
const user_raffle_task_entity_1 = require("../../domain/entities/user-raffle-task.entity");
let RaffleService = class RaffleService {
    userRepository;
    raffleRepository;
    ticketRepository;
    taskRepository;
    userTaskRepository;
    constructor(userRepository, raffleRepository, ticketRepository, taskRepository, userTaskRepository) {
        this.userRepository = userRepository;
        this.raffleRepository = raffleRepository;
        this.ticketRepository = ticketRepository;
        this.taskRepository = taskRepository;
        this.userTaskRepository = userTaskRepository;
    }
    async getActiveRaffles(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const now = new Date();
        const raffles = await this.raffleRepository.find({
            where: {
                isActive: true,
                status: (0, typeorm_2.In)([raffle_entity_1.RaffleStatus.UPCOMING, raffle_entity_1.RaffleStatus.ACTIVE]),
                requiredLevel: (0, typeorm_2.LessThanOrEqual)(user.level),
            },
            order: { sortOrder: 'ASC', startsAt: 'ASC' },
        });
        const raffleIds = raffles.map((r) => r.id);
        const userTickets = await this.ticketRepository.find({
            where: { userId, raffleId: (0, typeorm_2.In)(raffleIds) },
        });
        const ticketCountMap = new Map();
        userTickets.forEach((ticket) => {
            const count = ticketCountMap.get(ticket.raffleId) || 0;
            ticketCountMap.set(ticket.raffleId, count + 1);
        });
        return raffles.map((raffle) => ({
            ...this.formatRaffle(raffle),
            userTicketCount: ticketCountMap.get(raffle.id) || 0,
            isStarted: now >= raffle.startsAt,
            isEnded: now >= raffle.endsAt,
        }));
    }
    async getRaffleDetails(userId, raffleId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const raffle = await this.raffleRepository.findOne({
            where: { id: raffleId },
            relations: ['tasks'],
        });
        if (!raffle)
            throw new common_1.NotFoundException('Raffle not found');
        const userTickets = await this.ticketRepository.find({
            where: { userId, raffleId },
        });
        const userTasks = await this.userTaskRepository.find({
            where: { userId, raffleId },
        });
        const userTaskMap = new Map(userTasks.map((ut) => [ut.taskId, ut]));
        const tasks = raffle.tasks
            .filter((t) => t.status === raffle_task_entity_1.RaffleTaskStatus.ACTIVE)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((task) => {
            const userTask = userTaskMap.get(task.id);
            return {
                ...this.formatTask(task),
                userStatus: userTask?.status || null,
                isCompleted: userTask?.status === user_raffle_task_entity_1.UserRaffleTaskStatus.COMPLETED,
                ticketsClaimed: userTask?.ticketsClaimed || false,
            };
        });
        return {
            ...this.formatRaffle(raffle),
            tasks,
            userTickets: userTickets.map((t) => ({
                id: t.id,
                ticketNumber: t.ticketNumber,
                createdAt: t.createdAt,
            })),
            userTicketCount: userTickets.length,
        };
    }
    async startTaskVerification(userId, raffleId, taskId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const raffle = await this.raffleRepository.findOne({
            where: { id: raffleId },
        });
        if (!raffle)
            throw new common_1.NotFoundException('Raffle not found');
        if (raffle.status !== raffle_entity_1.RaffleStatus.ACTIVE) {
            throw new common_1.BadRequestException('This raffle is not active');
        }
        const now = new Date();
        if (now < raffle.startsAt || now > raffle.endsAt) {
            throw new common_1.BadRequestException('Raffle participation period is not active');
        }
        const task = await this.taskRepository.findOne({
            where: { id: taskId, raffleId },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (task.status !== raffle_task_entity_1.RaffleTaskStatus.ACTIVE) {
            throw new common_1.BadRequestException('This task is not active');
        }
        let userTask = await this.userTaskRepository.findOne({
            where: { userId, taskId },
        });
        if (userTask) {
            if (userTask.status === user_raffle_task_entity_1.UserRaffleTaskStatus.COMPLETED) {
                throw new common_1.BadRequestException('Task already completed');
            }
            if (userTask.status === user_raffle_task_entity_1.UserRaffleTaskStatus.VERIFYING) {
                return {
                    success: true,
                    message: 'Task verification already in progress',
                    status: userTask.status,
                };
            }
        }
        if (!userTask) {
            userTask = this.userTaskRepository.create({
                userId,
                taskId,
                raffleId,
                status: user_raffle_task_entity_1.UserRaffleTaskStatus.PENDING,
            });
        }
        userTask.status = user_raffle_task_entity_1.UserRaffleTaskStatus.VERIFYING;
        await this.userTaskRepository.save(userTask);
        return {
            success: true,
            message: 'Task verification started. Complete the task and click verify.',
            status: userTask.status,
            targetUrl: task.targetUrl,
        };
    }
    async verifyTask(userId, raffleId, taskId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const task = await this.taskRepository.findOne({
            where: { id: taskId, raffleId },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        let userTask = await this.userTaskRepository.findOne({
            where: { userId, taskId },
        });
        if (!userTask) {
            throw new common_1.BadRequestException('Please start the task first');
        }
        if (userTask.status === user_raffle_task_entity_1.UserRaffleTaskStatus.COMPLETED) {
            throw new common_1.BadRequestException('Task already completed');
        }
        const verified = await this.performExternalVerification(user, task);
        if (verified) {
            userTask.status = user_raffle_task_entity_1.UserRaffleTaskStatus.COMPLETED;
            userTask.verifiedAt = new Date();
            await this.userTaskRepository.save(userTask);
            return {
                success: true,
                message: 'Task verified successfully!',
                status: userTask.status,
                canClaimTickets: !userTask.ticketsClaimed,
                ticketsReward: task.ticketsReward,
            };
        }
        else {
            userTask.status = user_raffle_task_entity_1.UserRaffleTaskStatus.FAILED;
            userTask.failureReason = 'Verification failed. Please complete the task and try again.';
            await this.userTaskRepository.save(userTask);
            return {
                success: false,
                message: 'Verification failed. Please complete the task and try again.',
                status: userTask.status,
            };
        }
    }
    async claimTickets(userId, raffleId, taskId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const raffle = await this.raffleRepository.findOne({
            where: { id: raffleId },
        });
        if (!raffle)
            throw new common_1.NotFoundException('Raffle not found');
        const task = await this.taskRepository.findOne({
            where: { id: taskId, raffleId },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        const userTask = await this.userTaskRepository.findOne({
            where: { userId, taskId },
        });
        if (!userTask || userTask.status !== user_raffle_task_entity_1.UserRaffleTaskStatus.COMPLETED) {
            throw new common_1.BadRequestException('Task not completed');
        }
        if (userTask.ticketsClaimed) {
            throw new common_1.BadRequestException('Tickets already claimed for this task');
        }
        const existingTickets = await this.ticketRepository.count({
            where: { userId, raffleId },
        });
        if (raffle.maxTicketsPerUser > 0 && existingTickets >= raffle.maxTicketsPerUser) {
            throw new common_1.BadRequestException('Maximum tickets reached for this raffle');
        }
        const ticketsToCreate = Math.min(task.ticketsReward, raffle.maxTicketsPerUser > 0 ? raffle.maxTicketsPerUser - existingTickets : task.ticketsReward);
        const tickets = [];
        for (let i = 0; i < ticketsToCreate; i++) {
            const ticket = this.ticketRepository.create({
                userId,
                raffleId,
                taskId,
                ticketNumber: this.generateTicketNumber(),
            });
            tickets.push(ticket);
        }
        await this.ticketRepository.save(tickets);
        raffle.totalTickets += ticketsToCreate;
        await this.raffleRepository.save(raffle);
        userTask.ticketsClaimed = true;
        await this.userTaskRepository.save(userTask);
        return {
            success: true,
            message: `${ticketsToCreate} ticket(s) claimed!`,
            tickets: tickets.map((t) => ({
                id: t.id,
                ticketNumber: t.ticketNumber,
            })),
            totalUserTickets: existingTickets + ticketsToCreate,
        };
    }
    async getUserTickets(userId, raffleId) {
        const where = { userId };
        if (raffleId) {
            where.raffleId = raffleId;
        }
        const tickets = await this.ticketRepository.find({
            where,
            relations: ['raffle'],
            order: { createdAt: 'DESC' },
        });
        return tickets.map((ticket) => ({
            id: ticket.id,
            ticketNumber: ticket.ticketNumber,
            raffleName: ticket.raffle?.title,
            raffleId: ticket.raffleId,
            isWinner: ticket.isWinner,
            createdAt: ticket.createdAt,
        }));
    }
    async getWinners(raffleId) {
        const where = {};
        if (raffleId) {
            const raffle = await this.raffleRepository.findOne({
                where: { id: raffleId },
            });
            if (!raffle)
                throw new common_1.NotFoundException('Raffle not found');
            const winners = await this.ticketRepository.find({
                where: { raffleId, isWinner: true },
                relations: ['user', 'raffle'],
            });
            return winners.map((ticket) => ({
                raffleId: ticket.raffleId,
                raffleName: ticket.raffle?.title,
                ticketNumber: ticket.ticketNumber,
                userId: ticket.userId,
                username: ticket.user?.username,
                wonAt: ticket.wonAt,
            }));
        }
        const completedRaffles = await this.raffleRepository.find({
            where: { status: raffle_entity_1.RaffleStatus.COMPLETED },
            order: { drawAt: 'DESC' },
            take: 20,
        });
        const winnerTickets = await this.ticketRepository.find({
            where: {
                raffleId: (0, typeorm_2.In)(completedRaffles.map((r) => r.id)),
                isWinner: true,
            },
            relations: ['user', 'raffle'],
        });
        return winnerTickets.map((ticket) => ({
            raffleId: ticket.raffleId,
            raffleName: ticket.raffle?.title,
            ticketNumber: ticket.ticketNumber,
            userId: ticket.userId,
            username: ticket.user?.username,
            wonAt: ticket.wonAt,
        }));
    }
    async performExternalVerification(user, task) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (task.requiresManualVerification) {
            return true;
        }
        return true;
    }
    generateTicketNumber() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    formatRaffle(raffle) {
        return {
            id: raffle.id,
            title: raffle.title,
            description: raffle.description,
            imageUrl: raffle.imageUrl,
            bannerUrl: raffle.bannerUrl,
            status: raffle.status,
            prizeType: raffle.prizeType,
            prizeName: raffle.prizeName,
            prizeDescription: raffle.prizeDescription,
            prizeImageUrl: raffle.prizeImageUrl,
            prizeFollowersAmount: raffle.prizeFollowersAmount?.toString() || '0',
            prizeGemsAmount: raffle.prizeGemsAmount,
            prizeTokensAmount: raffle.prizeTokensAmount,
            startsAt: raffle.startsAt,
            endsAt: raffle.endsAt,
            drawAt: raffle.drawAt,
            maxTicketsPerUser: raffle.maxTicketsPerUser,
            totalTickets: raffle.totalTickets,
            numberOfWinners: raffle.numberOfWinners,
            requiredLevel: raffle.requiredLevel,
        };
    }
    formatTask(task) {
        return {
            id: task.id,
            type: task.type,
            title: task.title,
            description: task.description,
            iconUrl: task.iconUrl,
            targetUrl: task.targetUrl,
            ticketsReward: task.ticketsReward,
            requiresManualVerification: task.requiresManualVerification,
        };
    }
};
exports.RaffleService = RaffleService;
exports.RaffleService = RaffleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(raffle_entity_1.Raffle)),
    __param(2, (0, typeorm_1.InjectRepository)(raffle_ticket_entity_1.RaffleTicket)),
    __param(3, (0, typeorm_1.InjectRepository)(raffle_task_entity_1.RaffleTask)),
    __param(4, (0, typeorm_1.InjectRepository)(user_raffle_task_entity_1.UserRaffleTask)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RaffleService);
//# sourceMappingURL=raffle.service.js.map