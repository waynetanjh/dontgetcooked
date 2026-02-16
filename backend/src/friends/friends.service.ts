import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async create(createFriendDto: CreateFriendDto) {
    const friend = await this.prisma.friend.create({
      data: {
        name: createFriendDto.name,
        eventDate: new Date(createFriendDto.eventDate),
        eventLabel: createFriendDto.eventLabel,
        notes: createFriendDto.notes,
      },
    });

    return {
      success: true,
      data: friend,
      message: 'Event created successfully',
    };
  }

  async findAll() {
    const friends = await this.prisma.friend.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      data: friends,
      message: 'Events retrieved successfully',
    };
  }

  async findOne(id: string) {
    const friend = await this.prisma.friend.findUnique({
      where: { id },
    });

    if (!friend) {
      throw new NotFoundException('Event not found');
    }

    return {
      success: true,
      data: friend,
      message: 'Event retrieved successfully',
    };
  }

  async update(id: string, updateFriendDto: UpdateFriendDto) {
    // Check if friend exists
    const existingFriend = await this.prisma.friend.findUnique({
      where: { id },
    });

    if (!existingFriend) {
      throw new NotFoundException('Event not found');
    }

    const friend = await this.prisma.friend.update({
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
      data: friend,
      message: 'Event updated successfully',
    };
  }

  async remove(id: string) {
    // Check if friend exists
    const existingFriend = await this.prisma.friend.findUnique({
      where: { id },
    });

    if (!existingFriend) {
      throw new NotFoundException('Event not found');
    }

    await this.prisma.friend.delete({
      where: { id },
    });

    return {
      success: true,
      data: null,
      message: 'Event deleted successfully',
    };
  }
}
