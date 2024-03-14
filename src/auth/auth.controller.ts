import { Response } from 'express';
import { Controller, Get, Post, Body, Res, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';

import { LoginAdminDto } from './dto/login-admin.dto';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { getJWT } from './decorators/get-JWT.decorator';
import { JwtPayload } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  loginAdmin(@Body() loginData: LoginAdminDto, @Res() res: Response) {
    return this.authService.loginAdmin(loginData, res);
  }

  @Get('validate-cookie')
  @UseGuards(JwtAuthGuard)
  verificateJWT() {
    return { authenticated: true };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getAllAdmins() {
    return this.authService.getAdmins();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createAdmin(@Body() registerData: LoginAdminDto, @getJWT() jwt: JwtPayload) {
    return this.authService.createAdmin(registerData, jwt);
  }
}
