import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, AuthProvider } from '../../modules/users/user.entity';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createProductionAdmin() {
  console.log('🔐 Create Production Admin User\n');

  // Get admin details from user input
  const email = await question('Admin email: ');
  const firstName = await question('First name: ');
  const lastName = await question('Last name: ');
  const password = await question('Password (min 8 characters): ');
  const phone = await question('Phone (optional): ');

  if (!email || !firstName || !lastName || !password) {
    console.error('❌ All fields except phone are required!');
    rl.close();
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('❌ Password must be at least 8 characters!');
    rl.close();
    process.exit(1);
  }

  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ['src/**/*.entity.ts'],
    synchronize: false,
    logging: false,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  });

  try {
    await dataSource.initialize();
    console.log('\n✅ Database connected');

    const userRepository = dataSource.getRepository(User);

    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      console.error(`❌ User with email ${email} already exists!`);
      rl.close();
      await dataSource.destroy();
      process.exit(1);
    }

    // Create admin user
    const adminUser = userRepository.create({
      email,
      firstName,
      lastName,
      password, // Will be hashed by the entity
      role: UserRole.ADMIN,
      authProvider: AuthProvider.LOCAL,
      emailVerified: true,
      phone: phone || undefined,
      mustChangePassword: false,
    });

    await userRepository.save(adminUser);

    console.log('\n🎉 Production admin user created successfully!\n');
    console.log('Login credentials:');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}\n`);
    console.log('⚠️  Save these credentials securely!\n');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    rl.close();
    await dataSource.destroy();
  }
}

// Run if called directly
if (require.main === module) {
  createProductionAdmin();
}

export default createProductionAdmin;
