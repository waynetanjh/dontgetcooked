import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async create(createFriendDto: CreateFriendDto) {
    const event = await this.prisma.event.create({
      data: {
        name: createFriendDto.name,
        eventDate: new Date(createFriendDto.eventDate),
        eventLabel: createFriendDto.eventLabel,
        notes: createFriendDto.notes,
      },
    });

    return {
      success: true,
      data: event,
      message: 'Event created successfully',
    };
  }

  async findAll() {
    const events = await this.prisma.event.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: events,
      message: 'Events retrieved successfully',
    };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return {
      success: true,
      data: event,
      message: 'Event retrieved successfully',
    };
  }

  async update(id: string, updateFriendDto: UpdateFriendDto) {
    // Check if event exists
    const existingEvent = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    const event = await this.prisma.event.update({
      where: { id },
      data: {
        ...(updateFriendDto.name && { name: updateFriendDto.name }),
        ...(updateFriendDto.eventDate && {
          eventDate: new Date(updateFriendDto.eventDate),
        }),
        ...(updateFriendDto.eventLabel !== undefined && {
          eventLabel: updateFriendDto.eventLabel,
        }),
        ...(updateFriendDto.notes !== undefined && {
          notes: updateFriendDto.notes,
        }),
      },
    });

    return {
      success: true,
      data: event,
      message: 'Event updated successfully',
    };
  }

  async remove(id: string) {
    // Check if event exists
    const existingEvent = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return {
      success: true,
      data: null,
      message: 'Event deleted successfully',
    };
  }

  // Get distinct names for autocomplete
  async getDistinctNames(): Promise<string[]> {
    const events = await this.prisma.event.findMany({
      select: { name: true },
      distinct: ['name'],
      orderBy: { name: 'asc' },
    });

    return events.map((e) => e.name);
  }
}
