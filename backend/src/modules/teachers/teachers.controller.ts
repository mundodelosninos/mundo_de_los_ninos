import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto, UpdateTeacherDto } from './dto/teacher.dto';

@Controller('teachers')
@UseGuards(JwtAuthGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  create(@Body() createTeacherDto: CreateTeacherDto, @Request() req: any) {
    return this.teachersService.createTeacher(createTeacherDto, req.user);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.teachersService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.teachersService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
    @Request() req: any,
  ) {
    return this.teachersService.update(id, updateTeacherDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.teachersService.remove(id, req.user);
  }
}
