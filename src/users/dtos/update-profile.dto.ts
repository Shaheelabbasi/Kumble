// src/users/dto/update-profile.dto.ts
import { 
  IsOptional, IsString, IsInt, Min, Max, IsArray, ArrayMinSize, ArrayMaxSize 
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'John Doe', description: 'Display name of the user' })
  display_name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'I love coding and hiking', description: 'User biography' })
  bio?: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(120)
  @ApiPropertyOptional({ example: 25, description: 'Age of the user, must be between 18 and 120' })
  age?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'male', description: 'Gender of the user' })
  gender?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'USA', description: 'Country of the user' })
  country?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'New York', description: 'City of the user' })
  city?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'English', description: 'Preferred language of the user' })
  language?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '-73.935242', description: 'Longitude coordinate for user location' })
  longitude?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '40.73061', description: 'Latitude coordinate for user location' })
  latitude?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(3)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @ApiPropertyOptional({ 
    example: ['hobby1', 'hobby2', 'hobby3'], 
    description: 'Array of hobby IDs, minimum 3, maximum 5 items' 
  })
  hobbyIds?: string[];
}
