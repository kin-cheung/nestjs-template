import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../../src/auth/decorator/get-user.decorator';
import { JwtGuard } from '../../src/auth/guard/jwt.guard';
import { UserService } from './user.service';
import { EditUserDto } from './dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private service: UserService) {}

  // @HttpCode(HttpStatus.OK)
  @Get('me')
  getMe(@GetUser() user: User) {
    return user;
  }

  @Patch()
  editUser(@GetUser('id') userId: number, @Body() user: EditUserDto) {
    return this.service.editUser(userId, user);
  }
}
