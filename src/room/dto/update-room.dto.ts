import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRoomDto } from './create-room.dto';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateRoomDto {
  @ApiProperty({ example: '09:00' })
  @IsString()
  @IsNotEmpty()
  openTime: string;

  @ApiProperty({ example: '19:00' })
  @IsString()
  @IsNotEmpty()
  closeTime: string;
}
