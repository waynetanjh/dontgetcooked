import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post()
  create(@Body() createFriendDto: CreateFriendDto) {
    return this.friendsService.create(createFriendDto);
  }

  @Get()
  findAll() {
    return this.friendsService.findAll();
  }

  @Get('names/distinct')
  async getDistinctNames() {
    const names = await this.friendsService.getDistinctNames();
    return {
      success: true,
      data: names,
      message: 'Distinct names retrieved successfully',
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.friendsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateFriendDto: UpdateFriendDto) {
    return this.friendsService.update(id, updateFriendDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.friendsService.remove(id);
  }
}
