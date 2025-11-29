import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Student } from '../students/student.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  color: string;

  @Column({ type: 'int', nullable: true })
  maxStudents: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => User, (user) => user.groups)
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  @Column({ name: 'teacherId' })
  teacherId: string;

  @ManyToMany(() => Student, (student) => student.groups)
  @JoinTable({
    name: 'group_students',
    joinColumn: { name: 'groupId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'studentId', referencedColumnName: 'id' },
  })
  students: Student[];

  get studentCount(): number {
    return this.students?.length || 0;
  }
}