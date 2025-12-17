import { Injectable } from '@nestjs/common';
import { prisma } from 'src/prisma/prisma.client';
import { UpdateProfileDto } from './dtos/update-profile.dto';

@Injectable()
export class UsersService {
  constructor() {}

  async updateSecretKey(userId: string, secret: string) {
    return await prisma.users.update({
      where: { id: userId },
      data: {
        twoFASecret: secret,
        enable2FA: true,
      },
    });
  }
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const { latitude, longitude, hobbyIds, ...profileData } = dto;

    // If latitude and longitude are provided, convert to "POINT(lon lat)"
    const location =
      latitude !== undefined && longitude !== undefined
        ? `POINT(${longitude} ${latitude})`
        : undefined;

    const profile = await prisma.user_profiles.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        ...profileData,
        location,
      },
      update: {
        ...profileData,
        ...(location && { location }),
      },
    });

    // Handle hobbies if provided
    if (hobbyIds) {
      // Delete old hobbies
      await prisma.user_hobbies.deleteMany({ where: { user_id: userId } });

      // Insert new hobbies
      const hobbiesToCreate = hobbyIds.map((hobbyId) => ({
        user_id: userId,
        hobby_id: hobbyId,
      }));
      await prisma.user_hobbies.createMany({ data: hobbiesToCreate });
    }

    return profile;
  }

  async getProfile(userId: string) {
    return prisma.user_profiles.findUnique({
      where: { user_id: userId },
    });
  }
}
