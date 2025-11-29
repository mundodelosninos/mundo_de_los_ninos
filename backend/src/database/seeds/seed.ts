import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, AuthProvider } from '../../modules/users/user.entity';
import { Student } from '../../modules/students/student.entity';
import { Group } from '../../modules/groups/group.entity';
import { databaseConfig } from '../../config/database.config';
import { Gender } from '../../modules/students/student.entity';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: false,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  });
  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);
  const studentRepository = dataSource.getRepository(Student);
  const groupRepository = dataSource.getRepository(Group);

  console.log('🌱 Iniciando seed de la base de datos...');

  try {
    // Check if demo users already exist
    const existingAdmin = await userRepository.findOne({ where: { email: 'admin@test.com' } });
    const existingTeacher = await userRepository.findOne({ where: { email: 'maestro@test.com' } });
    const existingParent = await userRepository.findOne({ where: { email: 'padre@test.com' } });


    // Crear usuarios adicionales solo si no existen los demo
    let adminUser, teacherUser, parentUser, teacher2, parent2, parent3;

    if (!existingAdmin) {
      adminUser = userRepository.create({
        email: 'admin@test.com',
        firstName: 'Administrador',
        lastName: 'Demo',
        password: 'admin123',
        role: UserRole.ADMIN,
        authProvider: AuthProvider.LOCAL,
        emailVerified: true,
      });
      console.log('✅ Usuario admin demo creado');
    } else {
      console.log('ℹ️ Usuario admin demo ya existe');
    }

    if (!existingTeacher) {
      teacherUser = userRepository.create({
        email: 'maestro@test.com',
        firstName: 'Carmen',
        lastName: 'Rodríguez',
        password: 'maestro123',
        role: UserRole.TEACHER,
        authProvider: AuthProvider.LOCAL,
        emailVerified: true,
        phone: '+34 600 123 456',
      });
      console.log('✅ Usuario maestro demo creado');
    } else {
      console.log('ℹ️ Usuario maestro demo ya existe');
    }

    if (!existingParent) {
      parentUser = userRepository.create({
        email: 'padre@test.com',
        firstName: 'Juan',
        lastName: 'García',
        password: 'padre123',
        role: UserRole.PARENT,
        authProvider: AuthProvider.LOCAL,
        emailVerified: true,
        phone: '+34 600 789 123',
      });
      console.log('✅ Usuario padre demo creado');
    } else {
      console.log('ℹ️ Usuario padre demo ya existe');
    }

    // Más profesores
    teacher2 = userRepository.create({
      email: 'maria.lopez@guarderia.com',
      firstName: 'María',
      lastName: 'López',
      password: 'profesor123',
      role: UserRole.TEACHER,
      authProvider: AuthProvider.LOCAL,
      emailVerified: true,
      phone: '+34 600 234 567',
    });

    // Más padres
    parent2 = userRepository.create({
      email: 'ana.martinez@guarderia.com',
      firstName: 'Ana',
      lastName: 'Martínez',
      password: 'padre123',
      role: UserRole.PARENT,
      authProvider: AuthProvider.LOCAL,
      emailVerified: true,
      phone: '+34 600 345 678',
    });

    parent3 = userRepository.create({
      email: 'carlos.ruiz@guarderia.com',
      firstName: 'Carlos',
      lastName: 'Ruiz',
      password: 'padre123',
      role: UserRole.PARENT,
      authProvider: AuthProvider.LOCAL,
      emailVerified: true,
      phone: '+34 600 456 789',
    });

    // Guardar usuarios que fueron creados
    const usersToSave = [teacher2, parent2, parent3];
    if (adminUser) usersToSave.push(adminUser);
    if (teacherUser) usersToSave.push(teacherUser);
    if (parentUser) usersToSave.push(parentUser);

    await userRepository.save(usersToSave);
    console.log('✅ Usuarios creados');

    // Buscar o usar usuarios existentes para grupos
    const mainTeacher = teacherUser || existingTeacher;
    const secondTeacher = teacher2;

    // Crear grupos
    const grupoA = groupRepository.create({
      name: 'Grupo A - Pequeños Exploradores',
      description: 'Grupo para niños de 2-3 años',
      color: '#3B82F6',
      maxStudents: 15,
      teacher: mainTeacher,
    });

    const grupoB = groupRepository.create({
      name: 'Grupo B - Aventureros',
      description: 'Grupo para niños de 3-4 años',
      color: '#10B981',
      maxStudents: 18,
      teacher: secondTeacher,
    });

    const grupoC = groupRepository.create({
      name: 'Grupo C - Descubridores',
      description: 'Grupo para niños de 4-5 años',
      color: '#F59E0B',
      maxStudents: 20,
      teacher: mainTeacher,
    });

    await groupRepository.save([grupoA, grupoB, grupoC]);
    console.log('✅ Grupos creados');

    // Buscar o usar usuarios existentes para estudiantes
    const mainParent = parentUser || existingParent;

    // Crear estudiantes
    const students = [
      // Hijos del primer padre
      {
        firstName: 'María',
        lastName: 'García',
        birthDate: new Date('2021-03-15'),
        gender: Gender.FEMALE,
        allergies: 'Alergia a los frutos secos',
        parent: mainParent,
        groups: [grupoA],
      },
      {
        firstName: 'Pedro',
        lastName: 'García',
        birthDate: new Date('2019-07-22'),
        gender: Gender.MALE,
        observations: 'Le gusta mucho la música',
        parent: mainParent,
        groups: [grupoC],
      },
      // Hijos del segundo padre
      {
        firstName: 'Sofía',
        lastName: 'Martínez',
        birthDate: new Date('2020-11-08'),
        gender: Gender.FEMALE,
        allergies: 'Intolerancia a la lactosa',
        emergencyContact: 'Abuela Pilar',
        emergencyPhone: '+34 600 111 222',
        parent: parent2,
        groups: [grupoB],
      },
      {
        firstName: 'Diego',
        lastName: 'Martínez',
        birthDate: new Date('2021-05-12'),
        gender: Gender.MALE,
        observations: 'Muy sociable, le encanta jugar con otros niños',
        parent: parent2,
        groups: [grupoA],
      },
      // Hijos del tercer padre
      {
        firstName: 'Lucía',
        lastName: 'Ruiz',
        birthDate: new Date('2020-01-30'),
        gender: Gender.FEMALE,
        observations: 'Muy creativa, le gusta dibujar',
        parent: parent3,
        groups: [grupoB],
      },
      {
        firstName: 'Alejandro',
        lastName: 'Ruiz',
        birthDate: new Date('2019-09-18'),
        gender: Gender.MALE,
        allergies: 'Alergia al polen',
        emergencyContact: 'Tía Carmen',
        emergencyPhone: '+34 600 333 444',
        parent: parent3,
        groups: [grupoC],
      },
      // Estudiantes adicionales
      {
        firstName: 'Emma',
        lastName: 'López',
        birthDate: new Date('2021-12-03'),
        gender: Gender.FEMALE,
        parent: parent2,
        groups: [grupoA],
      },
      {
        firstName: 'Daniel',
        lastName: 'Sánchez',
        birthDate: new Date('2020-06-25'),
        gender: Gender.MALE,
        observations: 'Le gusta mucho leer cuentos',
        parent: parent3,
        groups: [grupoB],
      },
      {
        firstName: 'Valentina',
        lastName: 'Moreno',
        birthDate: new Date('2019-04-14'),
        gender: Gender.FEMALE,
        allergies: 'Alergia a los huevos',
        parent: mainParent,
        groups: [grupoC],
      },
      {
        firstName: 'Mateo',
        lastName: 'Jiménez',
        birthDate: new Date('2021-08-07'),
        gender: Gender.MALE,
        observations: 'Muy activo, le encantan los deportes',
        parent: parent2,
        groups: [grupoA],
      },
    ];

    for (const studentData of students) {
      const student = studentRepository.create(studentData);
      await studentRepository.save(student);
    }

    console.log('✅ Estudiantes creados');

    console.log(`
🎉 Seed completado exitosamente!

Usuarios demo disponibles:
👨‍💼 Admin: admin@test.com / admin123
👩‍🏫 Maestro: maestro@test.com / maestro123
👨‍👩‍👧‍👦 Padre: padre@test.com / padre123

Grupos creados: ${(await groupRepository.count())} grupos
Estudiantes creados: ${(await studentRepository.count())} estudiantes

¡La base de datos está lista para usar! 🚀
`);

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    await dataSource.destroy();
  }
}

// Ejecutar seed si se llama directamente
if (require.main === module) {
  seed();
}

export default seed;