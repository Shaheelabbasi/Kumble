import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { prisma } from 'src/prisma/prisma.client';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async signup(dto: SignupDto) {
    const existingUser = await prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await prisma.users.create({
      data: {
        email: dto.email,
        password_hash: hashedPassword,
        profile: {
          create: {
            display_name: dto.displayName,
            gender: dto.gender,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      displayName: user.profile?.display_name ?? null,
    };
  }

  async login(dto: LoginDto) {
    const user = await prisma.users.findUnique({
      where: { email: dto.email },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT

    if (user.enable2FA) {
      return {
        requires2FA: true,
        userId: user.id, // needed for OTP verification
      };
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.profile?.display_name ?? null,
      },
    };
  }

  async googleLogin(googleUser: {
    googleId: string;
    email: string;
    displayName: string;
  }) {
    let user = await prisma.users.findUnique({
      where: { email: googleUser.email },
      include: { profile: true },
    });

    
    if (!user) {
      user = await prisma.users.create({
        data: {
          email: googleUser.email,
          is_verified: true,
          password_hash:'',
          profile: {
            create: {
              display_name: googleUser.displayName,
            },
          },
        },
        include: { profile: true },
      });
    }

   
    if (user.enable2FA) {
      return {
        requires2FA: true,
        userId: user.id,
        provider: 'google',
      };
    }

    
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.profile?.display_name ?? null,
      },
    };
  }
}
