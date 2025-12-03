import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/create-auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // ---------------- LOGIN ----------------
  @Post('login')
  async login(@Body() data: AuthLoginDto) {
    const result = await this.authService.login(data);
    if (!result) {
      throw new HttpException(
        'Email or password is incorrect',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return result;
  }

  // ---------------- CURRENT USER ----------------
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async currentUser(@Req() req) {
    return this.authService.getCurrentUser(req.user.id);
  }

  // ---------------- FORGOT PASSWORD ----------------
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  // ---------------- RESET PASSWORD ----------------
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
