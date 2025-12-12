import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { prisma } from 'src/prisma/prisma.client';

import * as speakeasy from 'speakeasy';
import { UsersService } from 'src/users/users.service';
@Injectable()
export class TwoFactorAuthService {
  constructor(private readonly userService: UsersService) {}

  async enable2FA(userId: string): Promise<{ secret: string | null }> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found ');
    }

    if (user?.enable2FA) {
      return { secret: user.twoFASecret };
    }
    const secret = speakeasy.generateSecret().base32;
    await this.userService.updateSecretKey(user.id, secret);
    return { secret };
  }

  async disable2FA(userId: string) {
    return await prisma.users.update({
      where: { id: userId },
      data: {
        twoFASecret: null,
        enable2FA: false,
      },
    });
  }

  async validate2FAToken(
    userId: string,
    token: string,
  ): Promise<{ verified: boolean }> {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { twoFASecret: true },
      });

      if (!user || !user.twoFASecret) {
        throw new UnauthorizedException('2FA not enabled');
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        token,
        encoding: 'base32',
      });

      return { verified };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Error verifying token');
    }
  }
}
