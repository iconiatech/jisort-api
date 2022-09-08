import {
  Req,
  Get,
  Body,
  Post,
  HttpCode,
  UseGuards,
  HttpStatus,
  Controller,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { CreateUserDto, SignInUserDto } from './dtos';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/local/signup')
  @HttpCode(HttpStatus.CREATED)
  async signupLocal(@Body() body: CreateUserDto) {
    return this.authService.signupLocal(body);
  }

  @Post('/local/signin')
  @HttpCode(HttpStatus.OK)
  async signinLocal(@Body() body: SignInUserDto) {
    return this.authService.signinLocal(body);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken() {
    return this.authService.refreshToken();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/whoami')
  async whoami(@Req() req: Request) {
    return this.authService.whoami(req.user['sub']);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logOut(@Req() req: Request) {
    return this.authService.logOut(req.user['sub']);
  }
}
