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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async currentUser(@Req() req) {
    return this.authService.getCurrentUser(req.user.id);
  }
}
