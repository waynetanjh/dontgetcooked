import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
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
  create(@Body() createFriendDto: CreateFriendDto, @Request() req) {
    const userId = req.user.id;
    return this.friendsService.create(createFriendDto, userId);
  }

  @Get()
  findAll(@Request() req) {
    const userId = req.user.id;
    return this.friendsService.findAll(userId);
  }

  @Get('names/distinct')
  async getDistinctNames(@Request() req) {
    const userId = req.user.id;
    const names = await this.friendsService.getDistinctNames(userId);
    return {
      success: true,
      data: names,
      message: 'Distinct names retrieved successfully',
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.friendsService.findOne(id, userId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateFriendDto: UpdateFriendDto, @Request() req) {
    const userId = req.user.id;
    return this.friendsService.update(id, updateFriendDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.friendsService.remove(id, userId);
  }
}
