import { Injectable } from '@nestjs/common';
import { prisma } from 'src/prisma/prisma.client';

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
}
