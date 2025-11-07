import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ---------------- CREATE ----------------
  @Post()
  async create(@Body() data: CreateUserDto) {
    return this.userService.create(data);
  }

  // ---------------- READ ALL ----------------
  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  // ---------------- READ ONE ----------------
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  // ---------------- UPDATE ----------------
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateUserDto) {
    return this.userService.update(id, data);
  }

  // ---------------- DELETE ----------------
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
