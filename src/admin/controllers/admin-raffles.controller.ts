import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminAuthGuard } from '../guards/admin-auth.guard';
import { Raffle, RaffleStatus } from '../../domain/entities/raffle.entity';
import { RaffleTask } from '../../domain/entities/raffle-task.entity';
import { RaffleTicket } from '../../domain/entities/raffle-ticket.entity';

@Controller('admin/raffles')
@UseGuards(AdminAuthGuard)
export class AdminRafflesController {
  constructor(
    @InjectRepository(Raffle)
    private raffleRepository: Repository<Raffle>,
    @InjectRepository(RaffleTask)
    private taskRepository: Repository<RaffleTask>,
    @InjectRepository(RaffleTicket)
    private ticketRepository: Repository<RaffleTicket>,
  ) {}

  // Raffles CRUD
  @Get()
  async getRaffles() {
    return this.raffleRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  @Get(':id')
  async getRaffle(@Param('id') id: string) {
    return this.raffleRepository.findOne({
      where: { id },
      relations: ['tasks', 'tickets'],
    });
  }

  @Post()
  async createRaffle(@Body() data: Partial<Raffle>) {
    const raffle = this.raffleRepository.create(data);
    return this.raffleRepository.save(raffle);
  }

  @Put(':id')
  async updateRaffle(@Param('id') id: string, @Body() data: Partial<Raffle>) {
    await this.raffleRepository.update(id, data);
    return this.raffleRepository.findOne({ where: { id } });
  }

  @Delete(':id')
  async deleteRaffle(@Param('id') id: string) {
    await this.raffleRepository.delete(id);
    return { success: true };
  }

  // Tasks CRUD
  @Get(':raffleId/tasks')
  async getTasks(@Param('raffleId') raffleId: string) {
    return this.taskRepository.find({
      where: { raffleId },
      order: { sortOrder: 'ASC' },
    });
  }

  @Post(':raffleId/tasks')
  async createTask(@Param('raffleId') raffleId: string, @Body() data: Partial<RaffleTask>) {
    const task = this.taskRepository.create({ ...data, raffleId });
    return this.taskRepository.save(task);
  }

  @Put('tasks/:taskId')
  async updateTask(@Param('taskId') taskId: string, @Body() data: Partial<RaffleTask>) {
    await this.taskRepository.update(taskId, data);
    return this.taskRepository.findOne({ where: { id: taskId } });
  }

  @Delete('tasks/:taskId')
  async deleteTask(@Param('taskId') taskId: string) {
    await this.taskRepository.delete(taskId);
    return { success: true };
  }

  // Draw winner
  @Post(':id/draw')
  async drawWinner(@Param('id') id: string) {
    const raffle = await this.raffleRepository.findOne({ where: { id } });
    if (!raffle) {
      throw new Error('Raffle not found');
    }

    if (raffle.status !== RaffleStatus.ACTIVE) {
      throw new Error('Raffle is not active');
    }

    const tickets = await this.ticketRepository.find({
      where: { raffleId: id },
    });

    if (tickets.length === 0) {
      throw new Error('No tickets in this raffle');
    }

    // Select random winners
    const winners: RaffleTicket[] = [];
    const availableTickets = [...tickets];

    for (let i = 0; i < raffle.numberOfWinners && availableTickets.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableTickets.length);
      const winnerTicket = availableTickets.splice(randomIndex, 1)[0];
      winnerTicket.isWinner = true;
      winnerTicket.wonAt = new Date();
      winners.push(winnerTicket);
    }

    await this.ticketRepository.save(winners);

    // Update raffle status
    raffle.status = RaffleStatus.COMPLETED;
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

  // Stats
  @Get(':id/stats')
  async getRaffleStats(@Param('id') id: string) {
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
}
