import { Repository } from 'typeorm';
import { AppConfig } from '../entities/app-config.entity';
interface SetConfigDto {
    key: string;
    value: any;
    description?: string;
}
interface UpdateConfigDto {
    value: any;
    description?: string;
}
export declare class AdminConfigController {
    private configRepository;
    constructor(configRepository: Repository<AppConfig>);
    getAllConfigs(): Promise<{
        data: AppConfig[];
        total: number;
    }>;
    getConfig(key: string): Promise<AppConfig | {
        error: string;
    }>;
    setConfig(dto: SetConfigDto): Promise<{
        success: boolean;
        message: string;
        data: AppConfig;
    }>;
    updateConfig(key: string, dto: UpdateConfigDto): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    deleteConfig(key: string): Promise<{
        error: string;
        success?: undefined;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    bulkSetConfigs(configs: SetConfigDto[]): Promise<{
        success: boolean;
        message: string;
        data: AppConfig[];
    }>;
}
export {};
