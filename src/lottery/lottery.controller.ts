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
  ParseUUIDPipe,
} from '@nestjs/common';

import { LotteryService } from './lottery.service';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

import { CreateLotteryDto } from './dto/create-lottery.dto';
import { UpdateLotteryDto } from './dto/update-lottery.dto';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ChangeWinnerDto } from './dto/change-winner.dto';

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

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLotteryDto: UpdateLotteryDto,
  ) {
    return this.lotteryService.update(id, updateLotteryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.lotteryService.remove(id);
  }

  @Post('participants/:term')
  addParticipants(
    @Param('term') term: string,
    @Body() addParticipants: CreateParticipantDto,
  ) {
    return this.lotteryService.addParticipants(term, addParticipants);
  }

  @Patch('winner/:id')
  @UseGuards(JwtAuthGuard)
  generateWinner(@Param('id', ParseUUIDPipe) id: string) {
    return this.lotteryService.generateWinner(id);
  }

  @Patch('change-winner/:id')
  @UseGuards(JwtAuthGuard)
  changeWinner(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changeWinnerDto: ChangeWinnerDto,
  ) {
    return this.lotteryService.changeWinner(id, changeWinnerDto);
  }

  @Patch('completed-lottery/:id')
  @UseGuards(JwtAuthGuard)
  closeLottery(@Param('id', ParseUUIDPipe) id: string) {
    return this.lotteryService.lotteryFinished(id);
  }
}
