import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../entities/booking.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async bookingMeetingRoom(body: CreateBookingDto) {
    try {
      const parseTimeToMinutes = (timeString) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
      };

      const startTimeMinutes = parseTimeToMinutes(body.startTime);
      const endTimeMinutes = parseTimeToMinutes(body.endTime);

      const booking = this.bookingRepository.create({
        name: body.name,
        bookingDate: body.bookingDate,
        startTime: body.startTime,
        endTime: body.endTime,
        room: { id: 1 },
      });

      console.log(
        '🚀 ~ BookingService ~ bookingMeetingRoom ~ endTimeMinutes:',
        endTimeMinutes,
      );
      console.log(
        '🚀 ~ BookingService ~ bookingMeetingRoom ~ startTimeMinutes:',
        startTimeMinutes,
      );
      console.log(
        '🚀 ~ BookingService ~ bookingMeetingRoom ~ endTimeMinutes - startTimeMinutes:',
        endTimeMinutes - startTimeMinutes,
      );

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
