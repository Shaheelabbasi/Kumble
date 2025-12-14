import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { prisma } from 'src/prisma/prisma.client';

import * as speakeasy from 'speakeasy';
import { UsersService } from 'src/users/users.service';
import * as QRCode from 'qrcode';
import { JwtService } from '@nestjs/jwt';
JwtService;
@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly userService: UsersService,

    private readonly jwtService: JwtService,
  ) {}

  async enable2FA(userId: string) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // ✅ If secret already exists, reuse it
    if (user.twoFASecret) {
      const otpauthUrl = this.createOtpAuthUrl(user.email, user.twoFASecret);

      const qrCode = await QRCode.toDataURL(otpauthUrl);

      return {
        secret: user.twoFASecret,
        otpauthUrl,
        qrCode,
      };
    }

    // ✅ Generate full secret object
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `MyApp (${user.email})`,
      issuer: 'MyApp',
    });
    //✅ Store ONLY base32 secret
    await prisma.users.update({
      where: { id: user.id },
      data: {
        twoFASecret: secret.base32,
        enable2FA: false, // ❗ NOT enabled yet
      },
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
      qrCode,
    };
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
  ) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        twoFASecret: true,
        enable2FA: true,
        id:true,
        email:true
      },
    });

    if (!user || !user.twoFASecret) {
      throw new UnauthorizedException('2FA not enabled');
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      token,
      encoding: 'base32',
      window: 1, // ✅ allow ±30s clock drift
    });

    if (!verified) {
      return { verified: false };
    }

    // ✅ Enable 2FA AFTER successful verification
    if (!user.enable2FA) {
      await prisma.users.update({
        where: { id: userId },
        data: { enable2FA: true },
      });
    }

    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  private createOtpAuthUrl(email: string, secret: string) {
    return `otpauth://totp/MyApp:${email}?secret=${secret}&issuer=MyApp`;
  }
}
