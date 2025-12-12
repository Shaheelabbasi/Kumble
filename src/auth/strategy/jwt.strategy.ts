import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { prisma } from 'src/prisma/prisma.client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SUPER_SECRET_KEY',
    });
  }

  async validate(payload: any) {
    // payload contains data we included in JWT
    const user = await prisma.users.findUnique({
      where: { id: payload.sub }
    });

    if (!user) {
      return null;
    }

    // Attach user info to request.user
    return {
      id: user.id,
      email: user.email,
    };
  }
}
