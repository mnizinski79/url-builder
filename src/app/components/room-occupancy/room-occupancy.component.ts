import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RoomConfig {
  adults: number;
  children: number;
  childAges: number[];
}

@Component({
  selector: 'app-room-occupancy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-occupancy.component.html',
  styleUrls: ['./room-occupancy.component.css'],
})
export class RoomOccupancyComponent implements OnChanges {
  @Input() roomCount = 0;
  @Input() rooms: RoomConfig[] = [];
  @Output() roomsChange = new EventEmitter<RoomConfig[]>();
  @Output() roomRemoved = new EventEmitter<number>(); // emits new room count after removal

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['roomCount']) {
      this.syncRooms();
    }
  }

  private syncRooms(): void {
    const current = [...this.rooms];
    while (current.length < this.roomCount) {
      current.push({ adults: 1, children: 0, childAges: [] });
    }
    if (current.length > this.roomCount) {
      current.length = this.roomCount;
    }
    this.rooms = current;
    this.emit();
  }

  increment(roomIndex: number, field: 'adults' | 'children'): void {
    const room = this.rooms[roomIndex];
    if (field === 'adults' && room.adults < 9) {
      room.adults++;
    } else if (field === 'children' && room.children < 9) {
      room.children++;
      room.childAges.push(0);
    }
    this.emit();
  }

  decrement(roomIndex: number, field: 'adults' | 'children'): void {
    const room = this.rooms[roomIndex];
    if (field === 'adults' && room.adults > 1) {
      room.adults--;
    } else if (field === 'children' && room.children > 0) {
      room.children--;
      room.childAges.pop();
    }
    this.emit();
  }

  incrementAge(roomIndex: number, childIndex: number): void {
    if (this.rooms[roomIndex].childAges[childIndex] < 17) {
      this.rooms[roomIndex].childAges[childIndex]++;
      this.emit();
    }
  }

  decrementAge(roomIndex: number, childIndex: number): void {
    if (this.rooms[roomIndex].childAges[childIndex] > 0) {
      this.rooms[roomIndex].childAges[childIndex]--;
      this.emit();
    }
  }

  removeRoom(index: number): void {
    this.rooms.splice(index, 1);
    const newCount = this.rooms.length;
    this.roomRemoved.emit(newCount);
    this.emit();
  }

  private emit(): void {
    this.roomsChange.emit([...this.rooms]);
  }
}
