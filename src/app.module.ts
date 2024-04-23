import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Room } from './entities/room.entity';
import { RoomModule } from './room/room.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456',
      database: 'newbooking',
      entities: [Booking, Room],
      synchronize: true,
    }),
    RoomModule,
    BookingModule,
  ],
})
export class AppModule {}
