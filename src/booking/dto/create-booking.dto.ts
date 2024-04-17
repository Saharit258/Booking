import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2024-04-16' })
  @IsNotEmpty()
  bookingDate: string;

  @ApiProperty({ example: '09:00' })
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '12:00' })
  @IsNotEmpty()
  endTime: string;
}
