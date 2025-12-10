import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  displayName?: string;

  @ApiPropertyOptional({ example: 'male' })
  gender?: string;
}
