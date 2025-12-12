import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrService {
  private qrStore = new Map<string, string>();

  async generate(text: string): Promise<string> {
    const qrData = await QRCode.toDataURL(text);
    this.qrStore.set(text, qrData);
    return qrData;
  }

  validate(text: string, qrData: string): boolean {
    const storedQr = this.qrStore.get(text);
    return storedQr === qrData;
  }
}
