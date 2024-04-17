import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from '../entities/room.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  async updateTime(body: UpdateRoomDto) {
    try {
      if (body.openTime > body.closeTime) {
        throw new Error('เวลาเปิด กับ เวลาปิด ไม่อยู่ในรูปแบบที่ต้องการ');
      }

      if (body.openTime == body.closeTime) {
        throw new Error('เวลาเปิด กับ เวลาปิด ไม่อยู่ในรูปแบบที่ต้องการ');
      }

      const updateResult = await this.roomRepository.update({ id: 1 }, body);
      if (updateResult.affected === 0) {
        throw new Error(`หาไอดีไม่เจอ`);
      }

      const updatedTime = await this.roomRepository.findOne({
        where: { id: 1 },
      });

      return updatedTime;
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  }
}