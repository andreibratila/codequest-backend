import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { LotteryService } from './lottery.service';
import { CreateLotteryDto } from './dto/create-lottery.dto';
import { UpdateLotteryDto } from './dto/update-lottery.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('lottery')
export class LotteryController {
  constructor(private readonly lotteryService: LotteryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createLottery(@Body() createLotteryDto: CreateLotteryDto) {
    return this.lotteryService.createLottery(createLotteryDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.lotteryService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.lotteryService.findOne(term);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateLotteryDto: UpdateLotteryDto) {
  //   return this.lotteryService.update(+id, updateLotteryDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.lotteryService.remove(+id);
  // }
}
