import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('admin')
  seedAdmin() {
    return this.seedService.seedAdmin();
  }

  @Post()
  seedLottery() {
    return this.seedService.seedLottery();
  }
}
