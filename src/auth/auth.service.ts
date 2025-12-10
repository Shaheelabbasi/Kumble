import { BadRequestException, Injectable } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { prisma } from 'src/prisma/prisma.client';

@Injectable()
export class AuthService {
  
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
}
