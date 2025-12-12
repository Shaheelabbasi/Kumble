import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import fs from 'fs';
import handlebars from 'handlebars';
import * as mjml2html from 'mjml';

interface SendEmailVariables {
  [key: string]: any;
}

@Injectable()
export class EmailService {
 
  async sendEmail(
    to: string,
    subject: string,
    templatePath: string,
    variables: SendEmailVariables,
  ): Promise<void> {
    try {
      // 1. Load MJML template
      const mjmlFile = fs.readFileSync(templatePath, 'utf8');

      // 2. Compile template with Handlebars
      const compileTemplate = handlebars.compile(mjmlFile);
      const mjmlWithVars = compileTemplate(variables);

      // 3. Convert MJML → HTML
      const { html } = mjml2html(mjmlWithVars);

      // 4. Nodemailer transport (simplified, only auth)
      const transporter = nodemailer.createTransport({
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // 5. Send the email
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject,
        html,
      });

     
    } catch (error: any) {
      console.error(`Email send error: ${error.message}`);
      throw error;
    }
  }
}
