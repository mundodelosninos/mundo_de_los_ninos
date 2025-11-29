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
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto, AddStudentsToGroupDto } from './dto/group.dto';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto, @Request() req: any) {
    return this.groupsService.createGroup(createGroupDto, req.user);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.groupsService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.groupsService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @Request() req: any,
  ) {
    return this.groupsService.update(id, updateGroupDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.groupsService.remove(id, req.user);
  }

  @Post(':id/students')
  addStudents(
    @Param('id') id: string,
    @Body() addStudentsDto: AddStudentsToGroupDto,
    @Request() req: any,
  ) {
    return this.groupsService.addStudentsToGroup(id, addStudentsDto, req.user);
  }

  @Delete(':groupId/students/:studentId')
  removeStudent(
    @Param('groupId') groupId: string,
    @Param('studentId') studentId: string,
    @Request() req: any,
  ) {
    return this.groupsService.removeStudentFromGroup(groupId, studentId, req.user);
  }
}