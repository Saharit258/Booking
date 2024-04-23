import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Room } from '../entities/room.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', nullable: true, type: 'varchar' })
  name: string;

  @Column({ name: 'booking_date', nullable: true, type: 'date' })
  bookingDate: string;

  @Column({ name: 'start_time', nullable: true, type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', nullable: true, type: 'time' })
  endTime: string;

  @Column({
    name: 'is_dalete',
    nullable: true,
    type: 'boolean',
    default: false,
  })
  isDalete: boolean;

  @ManyToOne(() => Room, (room) => room.booking)
  room: Room;
}
