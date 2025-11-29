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
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  create(@Body() createStudentDto: CreateStudentDto, @Request() req: any) {
    return this.studentsService.createStudent(createStudentDto, req.user);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.studentsService.findAll(req.user);
  }

  @Get('check-parent-email')
  checkParentEmail(@Query('email') email: string, @Request() req: any) {
    return this.studentsService.checkParentEmail(email, req.user);
  }

  @Get('upcoming-birthdays')
  getUpcomingBirthdays(@Query('days') days: string, @Request() req: any) {
    const daysAhead = days ? parseInt(days, 10) : 14; // Default to 14 days
    return this.studentsService.getUpcomingBirthdays(daysAhead, req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.studentsService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @Request() req: any,
  ) {
    return this.studentsService.update(id, updateStudentDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.studentsService.remove(id, req.user);
  }
}