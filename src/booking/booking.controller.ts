import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('bookings')
@ApiTags('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  async bookingMeetingRoom(@Body() body: CreateBookingDto) {
    try {
      const data = await this.bookingService.bookingMeetingRoom(body);
      return { data };
    } catch (error) {
      throw new BadRequestException(`${error.message}`);
    }
  }

  @Get()
  async getBooking() {
    const data = await this.bookingService.getBooking();
    return { data };
  }

  @Delete('cancel')
  async cancelBooking(@Body() body: CreateBookingDto) {
    try {
      await this.bookingService.cancelBooking(body);
      return { data: {} };
    } catch (error) {
      throw new BadRequestException(`${error.message}`);
    }
  }
}
