import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { Raffle, RaffleStatus } from '../../domain/entities/raffle.entity';
import { RaffleTicket } from '../../domain/entities/raffle-ticket.entity';
import { RaffleTask, RaffleTaskStatus } from '../../domain/entities/raffle-task.entity';
import { UserRaffleTask, UserRaffleTaskStatus } from '../../domain/entities/user-raffle-task.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RaffleService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Raffle)
    private raffleRepository: Repository<Raffle>,
    @InjectRepository(RaffleTicket)
    private ticketRepository: Repository<RaffleTicket>,
    @InjectRepository(RaffleTask)
    private taskRepository: Repository<RaffleTask>,
    @InjectRepository(UserRaffleTask)
    private userTaskRepository: Repository<UserRaffleTask>,
  ) {}

  async getActiveRaffles(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const now = new Date();
    const raffles = await this.raffleRepository.find({
      where: {
        isActive: true,
        status: In([RaffleStatus.UPCOMING, RaffleStatus.ACTIVE]),
        requiredLevel: LessThanOrEqual(user.level),
      },
      order: { sortOrder: 'ASC', startsAt: 'ASC' },
    });

    // Get user's tickets for each raffle
    const raffleIds = raffles.map((r) => r.id);
    const userTickets = await this.ticketRepository.find({
      where: { userId, raffleId: In(raffleIds) },
    });

    const ticketCountMap = new Map<string, number>();
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

  async getRaffleDetails(userId: string, raffleId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const raffle = await this.raffleRepository.findOne({
      where: { id: raffleId },
      relations: ['tasks'],
    });
    if (!raffle) throw new NotFoundException('Raffle not found');

    // Get user's tickets
    const userTickets = await this.ticketRepository.find({
      where: { userId, raffleId },
    });

    // Get user's task completion status
    const userTasks = await this.userTaskRepository.find({
      where: { userId, raffleId },
    });

    const userTaskMap = new Map(
      userTasks.map((ut) => [ut.taskId, ut]),
    );

    const tasks = raffle.tasks
      .filter((t) => t.status === RaffleTaskStatus.ACTIVE)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((task) => {
        const userTask = userTaskMap.get(task.id);
        return {
          ...this.formatTask(task),
          userStatus: userTask?.status || null,
          isCompleted: userTask?.status === UserRaffleTaskStatus.COMPLETED,
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

  async startTaskVerification(userId: string, raffleId: string, taskId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const raffle = await this.raffleRepository.findOne({
      where: { id: raffleId },
    });
    if (!raffle) throw new NotFoundException('Raffle not found');

    if (raffle.status !== RaffleStatus.ACTIVE) {
      throw new BadRequestException('This raffle is not active');
    }

    const now = new Date();
    if (now < raffle.startsAt || now > raffle.endsAt) {
      throw new BadRequestException('Raffle participation period is not active');
    }

    const task = await this.taskRepository.findOne({
      where: { id: taskId, raffleId },
    });
    if (!task) throw new NotFoundException('Task not found');

    if (task.status !== RaffleTaskStatus.ACTIVE) {
      throw new BadRequestException('This task is not active');
    }

    // Check if already started
    let userTask = await this.userTaskRepository.findOne({
      where: { userId, taskId },
    });

    if (userTask) {
      if (userTask.status === UserRaffleTaskStatus.COMPLETED) {
        throw new BadRequestException('Task already completed');
      }
      if (userTask.status === UserRaffleTaskStatus.VERIFYING) {
        return {
          success: true,
          message: 'Task verification already in progress',
          status: userTask.status,
        };
      }
    }

    // Create or update user task
    if (!userTask) {
      userTask = this.userTaskRepository.create({
        userId,
        taskId,
        raffleId,
        status: UserRaffleTaskStatus.PENDING,
      });
    }

    userTask.status = UserRaffleTaskStatus.VERIFYING;
    await this.userTaskRepository.save(userTask);

    return {
      success: true,
      message: 'Task verification started. Complete the task and click verify.',
      status: userTask.status,
      targetUrl: task.targetUrl,
    };
  }

  async verifyTask(userId: string, raffleId: string, taskId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const task = await this.taskRepository.findOne({
      where: { id: taskId, raffleId },
    });
    if (!task) throw new NotFoundException('Task not found');

    let userTask = await this.userTaskRepository.findOne({
      where: { userId, taskId },
    });

    if (!userTask) {
      throw new BadRequestException('Please start the task first');
    }

    if (userTask.status === UserRaffleTaskStatus.COMPLETED) {
      throw new BadRequestException('Task already completed');
    }

    // For now, we'll simulate verification success
    // In production, this would call external APIs (Instagram, Twitter, etc.)
    const verified = await this.performExternalVerification(user, task);

    if (verified) {
      userTask.status = UserRaffleTaskStatus.COMPLETED;
      userTask.verifiedAt = new Date();
      await this.userTaskRepository.save(userTask);

      return {
        success: true,
        message: 'Task verified successfully!',
        status: userTask.status,
        canClaimTickets: !userTask.ticketsClaimed,
        ticketsReward: task.ticketsReward,
      };
    } else {
      userTask.status = UserRaffleTaskStatus.FAILED;
      userTask.failureReason = 'Verification failed. Please complete the task and try again.';
      await this.userTaskRepository.save(userTask);

      return {
        success: false,
        message: 'Verification failed. Please complete the task and try again.',
        status: userTask.status,
      };
    }
  }

  async claimTickets(userId: string, raffleId: string, taskId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const raffle = await this.raffleRepository.findOne({
      where: { id: raffleId },
    });
    if (!raffle) throw new NotFoundException('Raffle not found');

    const task = await this.taskRepository.findOne({
      where: { id: taskId, raffleId },
    });
    if (!task) throw new NotFoundException('Task not found');

    const userTask = await this.userTaskRepository.findOne({
      where: { userId, taskId },
    });

    if (!userTask || userTask.status !== UserRaffleTaskStatus.COMPLETED) {
      throw new BadRequestException('Task not completed');
    }

    if (userTask.ticketsClaimed) {
      throw new BadRequestException('Tickets already claimed for this task');
    }

    // Check max tickets per user
    const existingTickets = await this.ticketRepository.count({
      where: { userId, raffleId },
    });

    if (raffle.maxTicketsPerUser > 0 && existingTickets >= raffle.maxTicketsPerUser) {
      throw new BadRequestException('Maximum tickets reached for this raffle');
    }

    // Create tickets
    const ticketsToCreate = Math.min(
      task.ticketsReward,
      raffle.maxTicketsPerUser > 0 ? raffle.maxTicketsPerUser - existingTickets : task.ticketsReward,
    );

    const tickets: RaffleTicket[] = [];
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

    // Update total tickets on raffle
    raffle.totalTickets += ticketsToCreate;
    await this.raffleRepository.save(raffle);

    // Mark tickets as claimed
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

  async getUserTickets(userId: string, raffleId?: string) {
    const where: { userId: string; raffleId?: string } = { userId };
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

  async getWinners(raffleId?: string) {
    const where: { status?: RaffleStatus } = {};
    if (raffleId) {
      const raffle = await this.raffleRepository.findOne({
        where: { id: raffleId },
      });
      if (!raffle) throw new NotFoundException('Raffle not found');

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

    // Get all completed raffles with winners
    const completedRaffles = await this.raffleRepository.find({
      where: { status: RaffleStatus.COMPLETED },
      order: { drawAt: 'DESC' },
      take: 20,
    });

    const winnerTickets = await this.ticketRepository.find({
      where: {
        raffleId: In(completedRaffles.map((r) => r.id)),
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

  // Helper methods
  private async performExternalVerification(user: User, task: RaffleTask): Promise<boolean> {
    // In a production environment, this would call external APIs
    // For now, we simulate successful verification
    // TODO: Implement actual Instagram/Twitter/etc. API verification

    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 500));

    // For manual verification tasks, always return true (admin will verify)
    if (task.requiresManualVerification) {
      return true;
    }

    // For automatic verification, simulate success
    // In production, check the actual social media action
    return true;
  }

  private generateTicketNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private formatRaffle(raffle: Raffle) {
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

  private formatTask(task: RaffleTask) {
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
}
