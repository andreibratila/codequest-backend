import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LotteryService } from './lottery.service';
import { CreateLotteryDto } from './dto/create-lottery.dto';
import { UpdateLotteryDto } from './dto/update-lottery.dto';

@Controller('lottery')
export class LotteryController {
  constructor(private readonly lotteryService: LotteryService) {}

  @Post()
  create(@Body() createLotteryDto: CreateLotteryDto) {
    return this.lotteryService.create(createLotteryDto);
  }

  @Get()
  findAll() {
    return this.lotteryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.lotteryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateLotteryDto: UpdateLotteryDto) {
    return this.lotteryService.update(id, updateLotteryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.lotteryService.remove(id);
  }

  @Post(':lotteryId/participant/:participantId')
  addParticipant(
    @Param('lotteryId') lotteryId: number,
    @Param('participantId') participantId: number,
  ) {
    return this.lotteryService.addParticipant(lotteryId, participantId);
  }

  //getAllParticipants
  // @Get(':lotteryId/participants')
  // getAllParticipants(@Param('lotteryId') lotteryId: number) {
  //   return this.lotteryService.getAllParticipants(lotteryId);
  // }
}
