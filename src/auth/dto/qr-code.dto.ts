// dto/generate-qr.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class GenerateQrDto {
  @ApiProperty({ description: 'Text or URL to encode in QR code', example: 'https://example.com' })
  text: string;
}


export class ValidateQrDto {
  @ApiProperty({ description: 'The original text or URL to validate', example: 'https://example.com' })
  text: string;

  @ApiProperty({ description: 'The QR code data (base64) to validate' })
  qrData: string;
}
