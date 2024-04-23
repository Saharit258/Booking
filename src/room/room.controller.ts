import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('rooms')
@ApiTags('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async getRoom() {
    const data = await this.roomService.getRoom();
    return { data };
  }

  @Put('/update-time')
  async updateTime(@Body() body: UpdateRoomDto) {
    try {
      const data = await this.roomService.updateTime(body);
      return { data };
    } catch (error) {
      throw new BadRequestException(`${error.message}`);
    }
  }
}
