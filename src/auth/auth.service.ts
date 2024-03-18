import { Response } from 'express';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { LoginAdminDto } from './dto/login-admin.dto';
import { Auth } from './entities/auth.entity';

import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  private enviroment: string;
  private cookieExpirationTime: number;
  private cookieName: string;

  constructor(
    @InjectModel(Auth) private authModel: typeof Auth,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.enviroment = configService.get('enviroment');
    this.cookieExpirationTime = configService.get('cookieExpirationTime');
    this.cookieName = configService.get('cookieName');
  }

  async loginAdmin(loginData: LoginAdminDto, res: Response) {
    const { user, password } = loginData;

    // Validate if exist user
    const userData = await this.authModel.findOne({
      where: {
        user: user,
      },
    });
    if (!userData) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    // Validate if the password is correct
    const validPassword = bcrypt.compareSync(password, userData.password);
    if (!validPassword) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    // Create JWT verificating admin
    const jwt = this.jwtService.sign({ id: userData.id });
    res.cookie(this.cookieName, jwt, {
      secure: this.enviroment === 'development' ? false : true,
      path: '/',
      maxAge: this.cookieExpirationTime,
    });

    return res.send({ authenticated: true });
  }

  async getAdmins() {
    const admins = await this.authModel.findAll({
      attributes: { exclude: ['password'] },
    });
    return admins;
  }

  async createAdmin(registerData: LoginAdminDto, jwt: JwtPayload) {
    const { password, user } = registerData;

    // Verify if exists user
    const existUser = await this.authModel.findOne({
      where: {
        user: user,
      },
    });
    if (existUser) {
      throw new ConflictException('user exists');
    }

    try {
      // Create user
      const newUser = await this.authModel.create({
        user,
        password: await bcrypt.hashSync(password, 10),
        createdBy: jwt.id,
      });

      // Obtener una versión limpia del objeto, excluyendo la contraseña
      const userWithoutPassword = newUser.get({ plain: true });
      delete userWithoutPassword.password;

      return userWithoutPassword;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
  deleteCookie(res: Response) {
    res.cookie(this.cookieName, '', {
      httpOnly: true,
      secure: this.enviroment === 'development' ? false : true,
      sameSite: 'strict',
      path: '/',
      maxAge: 0, //
    });
    return res.send({ authenticated: false });
  }

  private handleDBExceptions(error: any) {
    this.logger.log(`Error: ${error.message}\nStack: ${error.stack}`);

    throw new InternalServerErrorException('Please check server logs');
  }
}
