import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Booking } from '../entities/booking.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'open_time', nullable: true, type: 'time' })
  openTime: string;

  @Column({ name: 'close_time', nullable: true, type: 'time' })
  closeTime: string;

  @OneToMany(() => Booking, (booking) => booking.room)
  booking: Booking[];
}
