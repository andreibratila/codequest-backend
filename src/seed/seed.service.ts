import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';

import * as bcrypt from 'bcrypt';

import { Auth } from 'src/auth/entities/auth.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger('SeedService');
  private readonly adminUser: string;
  private readonly adminPassword: string;

  constructor(
    @InjectModel(Auth) private authModel: typeof Auth,
    private configService: ConfigService,
  ) {
    this.adminUser = configService.get('adminUser');
    this.adminPassword = configService.get('adminPassword');
  }
  async seedAdmin() {
    // Verify if there are admins
    const count = await this.authModel.count();
    if (count !== 0) {
      console.log('after error');
      throw new ConflictException('You cant create more admins');
    }
    console.log('before error ');
    const hashedPassword = await bcrypt.hash(this.adminPassword, 10);

    try {
      await this.authModel.create({
        user: this.adminUser,
        password: hashedPassword,
      });

      return { message: 'Admin user created successfully' };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  seedLottery() {
    return `This action returns a seed lotery`;
  }

  private handleDBExceptions(error: any) {
    this.logger.log(error);
    throw new InternalServerErrorException('Please check server logs');
  }
}
