import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PrizesService } from './prizes.service';
import { CreatePrizeDto } from './dto/create-prize.dto';

@Controller('prizes')
export class PrizesController {
  constructor(private readonly prizesService: PrizesService) {}

  @Post()
  create(@Body() createPrizesDto: CreatePrizeDto) {
    return this.prizesService.create(createPrizesDto);
  }

  @Get()
  findAll() {
    return this.prizesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.prizesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updatePrizesDto: CreatePrizeDto) {
    return this.prizesService.update(id, updatePrizesDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.prizesService.remove(id);
  }
}
