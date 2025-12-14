import { Injectable, BadRequestException } from '@nestjs/common';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  VerifiedRegistrationResponse,
  VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import { prisma } from 'src/prisma/prisma.client';
import { Buffer } from 'buffer';
@Injectable()
export class WebAuthnService {
  rpName = 'MyApp';
  rpID = process.env.RP_ID || 'localhost';
  origin = process.env.ORIGIN || 'http://localhost:3000';

  async generateRegistrationOptions(userId: string, email: string) {
    const options = generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpID,
      userID: this.stringToUint8Array(userId),
      userName: email,
      attestationType: 'none',
      authenticatorSelection: {
        userVerification: 'preferred',
      },
    });

    // Store challenge temporarily in DB or cache
    await prisma.users.update({
      where: { id: userId },
      data: { webauthn_challenge: (await options).challenge },
    });

    return options;
  }
  private stringToUint8Array(value: string) {
    return new Uint8Array(Buffer.from(value, 'utf-8'));
  }
  async verifyRegistration(userId: string, body: any) {
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user?.webauthn_challenge)
      throw new BadRequestException('Challenge missing');

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: user.webauthn_challenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
    });

    if (!verification.verified)
      throw new BadRequestException('Verification failed');
    const registrationInfo = verification?.registrationInfo;

    if (!registrationInfo) {
      throw new BadRequestException('Missing registration info');
    }

    const {
      credential: { id: credentialID, publicKey: credentialPublicKey, counter },
    } = registrationInfo;

    await prisma.webauthn_credentials.create({
      data: {
        user_id: userId,
        credential_id: this.stringToUint8Array(credentialID),
        public_key: credentialPublicKey,
        counter,
      },
    });

    return { success: true };
  }

  async generateLoginOptions(userId: string) {
    const credentials = await prisma.webauthn_credentials.findMany({
      where: { user_id: userId },
    });

    const options = await generateAuthenticationOptions({
      allowCredentials: credentials.map((c) => ({
        id: String(c.credential_id),
        type: 'public-key',
        transports: ['usb', 'ble', 'nfc', 'internal'],
      })),
      userVerification: 'preferred',
      rpID: this.rpID,
    });

    await prisma.users.update({
      where: { id: userId },
      data: { webauthn_challenge: options.challenge },
    });

    return options;
  }

  async verifyLogin(userId: string, body: any) {
    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user?.webauthn_challenge)
      throw new BadRequestException('Challenge missing');

    const credential = await prisma.webauthn_credentials.findFirst({
      where: {
        user_id: userId,
        credential_id: Buffer.from(body.rawId, 'base64'),
      },
    });
    if (!credential) throw new BadRequestException('Credential not found');

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: user.webauthn_challenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpID,
      credential: {
        id: String(credential.credential_id),
        publicKey: credential.public_key,
        counter: credential.counter,
      },
    });

    if (!verification.verified)
      throw new BadRequestException('Authentication failed');

    // Update counter
    await prisma.webauthn_credentials.update({
      where: { id: credential.id },
      data: { counter: verification.authenticationInfo.newCounter },
    });

    return { success: true };
  }
}
