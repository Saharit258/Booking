import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from '../entities/room.entity';
import { Repository } from 'typeorm';
import { Booking } from '../entities/booking.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async updateTime(body: UpdateRoomDto): Promise<Room> {
    try {
      const parseTimeToMinutesRoom = (timeString: string) => {
        const [hours, minutes, seconds = 0] = timeString.split(':').map(Number);
        if (seconds !== 0) {
          throw new BadRequestException('ห้ามใส่วินาที');
        }
        return hours * 60 + minutes;
      };

      const openTimeMinutes = parseTimeToMinutesRoom(body.openTime);
      const closeTimeMinutes = parseTimeToMinutesRoom(body.closeTime);

      if (openTimeMinutes > closeTimeMinutes) {
        throw new Error('เวลาเปิด กับ เวลาปิด ไม่อยู่ในรูปแบบที่ต้องการ');
      }

      if (openTimeMinutes == closeTimeMinutes) {
        throw new Error('เวลาเปิด กับ เวลาปิด ไม่อยู่ในรูปแบบที่ต้องการ');
      }

      const updateResult = await this.roomRepository.update({ id: 1 }, body);
      if (updateResult.affected === 0) {
        throw new Error(`หาไอดีไม่เจอ`);
      }

      const updatedTime = await this.roomRepository.findOne({
        where: { id: 1 },
      });

      const removeBookings = await this.bookingRepository.find({
        where: { room: { id: 1 } },
      });

      for (const booking of removeBookings) {
        const startTimeMinutes = parseTimeToMinutesRoom(booking.startTime);
        const endTimeMinutes = parseTimeToMinutesRoom(booking.endTime);

        if (startTimeMinutes > openTimeMinutes) {
          await this.bookingRepository.update(
            { id: booking.id },
            { isDalete: true },
          );
        } else if (closeTimeMinutes < endTimeMinutes) {
          await this.bookingRepository.update(
            { id: booking.id },
            { isDalete: true },
          );
        }
      }

      return updatedTime;
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  }

  async getRoom(): Promise<Room[]> {
    [];
    const data = await this.roomRepository.find();
    return data;
  }
}
