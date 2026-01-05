import { User } from './user.entity';
import { Upgrade } from './upgrade.entity';
export declare class UserUpgrade {
    id: string;
    user: User;
    userId: string;
    upgrade: Upgrade;
    upgradeId: string;
    level: number;
}
