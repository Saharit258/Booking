import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { RemoveCreateBookingDto } from './dto/create-booking.dto';
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

  async bookingMeetingRoom(body: CreateBookingDto): Promise<Booking> {
    try {
      const thaiTime = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
      console.log(
        '🚀 ~ BookingService ~ bookingMeetingRoom ~ thaiTime:',
        thaiTime,
      );

      const bookingDate = new Date(body.bookingDate);

      const todayWithoutTime = new Date(
        thaiTime.getFullYear(),
        thaiTime.getMonth(),
        thaiTime.getDate(),
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
        const [hours, minutes, seconds = 0] = timeString.split(':').map(Number);
        if (minutes !== 0) {
          throw new BadRequestException('ตรวจสอบเวลาที่เลือก ตัวอย่าง 12:00');
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

      const checkNameBooking = await this.bookingRepository.findOne({
        where: {
          name: body.name,
          bookingDate: body.bookingDate,
          room: { id: 1 },
          isDalete: false,
        },
      });

      if (checkNameBooking) {
        throw new BadRequestException(
          'ไม่สามารถจองได้ เนื่องจากมีการจองอื่นในวันเดียวกันแล้ว',
        );
      }

      const existingBookings = await this.bookingRepository.find({
        where: {
          bookingDate: body.bookingDate,
          room: { id: 1 },
          isDalete: false,
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

      const currentTimeMinutes =
        thaiTime.getHours() * 60 + thaiTime.getMinutes();
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

  async getBooking(): Promise<Booking[]> {
    const data = await this.bookingRepository.find({
      where: { isDalete: false },
      order: { bookingDate: 'ASC', startTime: 'ASC' },
    });
    return data;
  }

  async cancelBooking(body: CreateBookingDto): Promise<boolean> {
    try {
      const { name, bookingDate, startTime, endTime } = body;

      const bookingToCancel = await this.bookingRepository.findOne({
        where: {
          name,
          bookingDate,
          startTime,
          endTime,
          room: { id: 1 },
          isDalete: false,
        },
      });

      if (bookingToCancel) {
        bookingToCancel.isDalete = true;
        await this.bookingRepository.save(bookingToCancel);
        return true;
      } else {
        throw new BadRequestException('ไม่พบการจองที่ต้องการยกเลิก');
      }
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  }
}
