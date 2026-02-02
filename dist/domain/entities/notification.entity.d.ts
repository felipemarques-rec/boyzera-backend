import { User } from './user.entity';
import { Character } from './character.entity';
export declare enum NotificationType {
    LEVEL_UP = "level_up",
    MISSION_COMPLETE = "mission_complete",
    REFERRAL_BONUS = "referral_bonus",
    ENERGY_FULL = "energy_full",
    DAILY_REWARD = "daily_reward",
    ACHIEVEMENT = "achievement",
    CHALLENGE_INVITE = "challenge_invite",
    CHALLENGE_RESULT = "challenge_result",
    SEASON_END = "season_end",
    SYSTEM = "system"
}
export declare class Notification {
    id: string;
    userId: string;
    user: User;
    type: NotificationType;
    title: string;
    message: string;
    iconName: string;
    data: Record<string, any>;
    isRead: boolean;
    readAt: Date;
    actionUrl: string;
    characterId: string;
    character: Character;
    createdAt: Date;
}
