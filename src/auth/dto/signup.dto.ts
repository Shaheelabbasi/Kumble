import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'StrongPassword123', minLength: 6 })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'REF123' })
  @IsOptional()
  referralCode?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  displayName?: string;

  @ApiPropertyOptional({ enum: ['male', 'female', 'other'], example: 'male' })
  @IsOptional()
  gender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsOptional()
  dateOfBirth?: string; // ISO string
}
