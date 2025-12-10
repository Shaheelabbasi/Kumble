import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserResponseDto } from './dto/signup-response.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

 @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 400, description: 'Email already registered.' })
  @ApiResponse({ status: 201, description: 'User created',type:UserResponseDto, })
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  // @Get()
  // findAll() {
  //   return this.authService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }

  
}
