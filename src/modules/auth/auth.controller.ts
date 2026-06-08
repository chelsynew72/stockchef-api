import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('register') @ApiOperation({ summary: 'Register user (admin/staff/supplier)' }) register(@Body() dto: RegisterDto) { return this.authService.register(dto); }
  @Post('login') @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Login' }) login(@Body() dto: LoginDto) { return this.authService.login(dto); }
}
