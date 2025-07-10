import { PrismaClient } from '@prisma/client';

export class SettingRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async saveSetting(key: string, value: string): Promise<void> {
    await this.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
  }

  async getSetting(key: string): Promise<string | null> {
    const setting = await this.prisma.setting.findUnique({
      where: { key }
    });

    return setting?.value || null;
  }

  async deleteSetting(key: string): Promise<void> {
    await this.prisma.setting.delete({
      where: { key }
    });
  }

  async getAllSettings(): Promise<Record<string, string>> {
    const settings = await this.prisma.setting.findMany();
    
    const settingsMap: Record<string, string> = {};
    settings.forEach(setting => {
      settingsMap[setting.key] = setting.value;
    });

    return settingsMap;
  }

  async getSettingsByPrefix(prefix: string): Promise<Record<string, string>> {
    const settings = await this.prisma.setting.findMany({
      where: {
        key: {
          startsWith: prefix
        }
      }
    });
    
    const settingsMap: Record<string, string> = {};
    settings.forEach(setting => {
      settingsMap[setting.key] = setting.value;
    });

    return settingsMap;
  }
} 