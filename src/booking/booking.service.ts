import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../entities/booking.entity';
import { Room } from '../entities/room.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  async bookingMeetingRoom(body: CreateBookingDto) {
    try {
      const today = new Date();
      const bookingDate = new Date(body.bookingDate);

      const todayWithoutTime = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );

      const bookingDateWithoutTime = new Date(
        bookingDate.getFullYear(),
        bookingDate.getMonth(),
        bookingDate.getDate(),
      );

      if (bookingDateWithoutTime < todayWithoutTime) {
        throw new BadRequestException('ไม่สามารถจองวันย้อนหลังได้');
      }

      const parseTimeToMinutes = (timeString: string) => {
        const [hours, minutes = 0, seconds = 0] = timeString
          .split(':')
          .map(Number);
        if (minutes !== 0) {
          throw new BadRequestException('เวลาที่กำหนดต้องเป็น 1 ชม');
        } else if (seconds !== 0) {
          throw new BadRequestException('ห้ามใส่วินาที');
        }
        return hours * 60;
      };

      const parseTimeToMinutesRoom = (timeString: string) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
      };

      const startTimeMinutes = parseTimeToMinutes(body.startTime);
      const endTimeMinutes = parseTimeToMinutes(body.endTime);

      const room = await this.roomRepository.findOne({ where: { id: 1 } });

      const openTimeMinutes = parseTimeToMinutesRoom(room.openTime);
      const closeTimeMinutes = parseTimeToMinutesRoom(room.closeTime);

      if (
        startTimeMinutes < openTimeMinutes ||
        endTimeMinutes > closeTimeMinutes
      ) {
        throw new BadRequestException(
          'เวลาที่ระบุไม่อยู่ในช่วงเวลาที่ห้องเปิดให้บริการ',
        );
      }

      const existingBookings = await this.bookingRepository.find({
        where: {
          bookingDate: body.bookingDate,
          room: { id: 1 },
        },
      });

      const conflictingBookings = existingBookings.filter(
        (booking) =>
          (startTimeMinutes >= parseTimeToMinutes(booking.startTime) &&
            startTimeMinutes < parseTimeToMinutes(booking.endTime)) ||
          (endTimeMinutes > parseTimeToMinutes(booking.startTime) &&
            endTimeMinutes <= parseTimeToMinutes(booking.endTime)),
      );

      if (conflictingBookings.length >= 3) {
        throw new BadRequestException(
          'ไม่สามารถจองได้ เวลานัดหมายที่ระบุมีการจองเต็มแล้ว',
        );
      }

      const currentTimeMinutes = today.getHours() * 60 + today.getMinutes();
      if (
        bookingDateWithoutTime.getTime() === todayWithoutTime.getTime() &&
        startTimeMinutes <= currentTimeMinutes
      ) {
        throw new BadRequestException(
          'ไม่สามารถจองในเวลาที่ผ่านไปของวันที่เดียวกันได้',
        );
      }

      const booking = this.bookingRepository.create({
        name: body.name,
        bookingDate: body.bookingDate,
        startTime: body.startTime,
        endTime: body.endTime,
        room: { id: 1 },
      });

      if (
        endTimeMinutes - startTimeMinutes == 60 ||
        endTimeMinutes - startTimeMinutes == 120 ||
        endTimeMinutes - startTimeMinutes == 180
      ) {
        const data = await this.bookingRepository.save(booking);
        return data;
      } else {
        throw new BadRequestException('ไม่สามารถจองได้');
      }
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  }
}
