import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserResponseDto } from './dto/signup-response.dto';
import { LoginDto } from './dto/login.dto';
import { TwoFactorAuthService } from './two-factor-auth';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Auth } from 'utils/decorators/current-user.decorator';
import { GoogleAuthGuard } from './guards/google-auth.guard';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,

    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 400, description: 'Email already registered.' })
  @ApiResponse({
    status: 201,
    description: 'User created',
    type: UserResponseDto,
  })
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'Successful login',
    schema: {
      example: {
        access_token: 'JWT_TOKEN_HERE',
        user: {
          id: 1,
          email: 'user@example.com',
          displayName: 'John Doe',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('enable-2fa')
  @UseGuards(JwtAuthGuard)
  enable2FA(@Auth() user) {
    return this.twoFactorAuthService.enable2FA(user.id);
  }

  @Post('validate-2fa')
  validate2FA(@Body() body: { userId: string; token: string }) {
    return this.twoFactorAuthService.validate2FAToken(body.userId, body.token);
  }

  @Get('disable-2fa')
  @UseGuards(JwtAuthGuard)
  disable2FA(@Auth() user) {
    return this.twoFactorAuthService.disable2FA(user.id);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Redirects automatically
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req) {
    return this.authService.googleLogin(req.user);
  }
}
