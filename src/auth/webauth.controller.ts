import { Controller, Post, Body, Param } from '@nestjs/common';
import { WebAuthnService } from './webauth.service';

@Controller('webauthn')
export class WebAuthnController {
  constructor(private readonly webAuthnService: WebAuthnService) {}

  @Post('register/options/:userId')
  generateRegistrationOptions(@Param('userId') userId: string, @Body() body: any) {
    return this.webAuthnService.generateRegistrationOptions(userId, body.email);
  }

  @Post('register/verify/:userId')
  verifyRegistration(@Param('userId') userId: string, @Body() body: any) {
    return this.webAuthnService.verifyRegistration(userId, body);
  }

  @Post('login/options/:userId')
  generateLoginOptions(@Param('userId') userId: string) {
    return this.webAuthnService.generateLoginOptions(userId);
  }

  @Post('login/verify/:userId')
  verifyLogin(@Param('userId') userId: string, @Body() body: any) {
    return this.webAuthnService.verifyLogin(userId, body);
  }
}
