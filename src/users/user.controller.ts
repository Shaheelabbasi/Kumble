import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Auth } from 'utils/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Retrieve the current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile returned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized JWT token missing or invalid',
     type:UpdateProfileDto
  })
  getProfile(@Auth() user) {
    return this.usersService.getProfile(user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update the current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type:UpdateProfileDto
  })
  @ApiResponse({ status: 400, description: 'Invalid profile data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized JWT token missing or invalid',
  })
  @ApiBody({ type: UpdateProfileDto })
  updateProfile(@Auth() user, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }
}
