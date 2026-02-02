import { User } from './user.entity';
import { RoulettePrize } from './roulette-prize.entity';
export declare class RouletteSpin {
    id: string;
    userId: string;
    user: User;
    prizeId: string;
    prize: RoulettePrize;
    rewardClaimed: {
        followers?: number;
        gems?: number;
        energy?: number;
        boosterType?: string;
    };
    loginStreakAtSpin: number;
    createdAt: Date;
}
