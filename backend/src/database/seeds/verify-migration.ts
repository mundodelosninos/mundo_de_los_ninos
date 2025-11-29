import { DataSource } from 'typeorm';

async function verifyMigration() {
  console.log('🔍 Verifying Migration Status\n');

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
    console.log('✅ Database connected\n');

    // Check migrations table
    console.log('📋 Executed Migrations:');
    const migrations = await dataSource.query(
      'SELECT * FROM migrations ORDER BY timestamp ASC'
    );

    if (migrations.length === 0) {
      console.log('⚠️  No migrations found! You need to run migrations.');
    } else {
      migrations.forEach((migration: any, index: number) => {
        console.log(`  ${index + 1}. ${migration.name} (${new Date(parseInt(migration.timestamp)).toISOString()})`);
      });
    }

    console.log('\n🔍 Checking attendances table structure:');

    // Check if defecation column exists
    const columns = await dataSource.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'attendances'
      ORDER BY ordinal_position
    `);

    console.log('\nColumns in attendances table:');
    columns.forEach((col: any) => {
      const marker = col.column_name === 'defecation' ? '✅' : '  ';
      console.log(`${marker} - ${col.column_name} (${col.udt_name})`);
    });

    // Check if defecation column specifically exists
    const defecationColumn = columns.find((col: any) => col.column_name === 'defecation');
    if (defecationColumn) {
      console.log('\n✅ Migration successful! Defecation column exists.');
    } else {
      console.log('\n⚠️  Migration may not have run! Defecation column is missing.');
    }

    // Check enum types
    console.log('\n🔍 Checking enum types:');
    const enums = await dataSource.query(`
      SELECT t.typname, e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname LIKE 'attendances_%' OR t.typname = 'defecation_status_enum'
      ORDER BY t.typname, e.enumsortorder
    `);

    const enumsByType: { [key: string]: string[] } = {};
    enums.forEach((e: any) => {
      if (!enumsByType[e.typname]) {
        enumsByType[e.typname] = [];
      }
      enumsByType[e.typname].push(e.enumlabel);
    });

    Object.keys(enumsByType).sort().forEach(typeName => {
      console.log(`\n  ${typeName}:`);
      enumsByType[typeName].forEach(label => {
        console.log(`    - ${label}`);
      });
    });

    console.log('\n✅ Verification complete!\n');

  } catch (error) {
    console.error('❌ Error verifying migration:', error);
  } finally {
    await dataSource.destroy();
  }
}

// Run if called directly
if (require.main === module) {
  verifyMigration();
}

export default verifyMigration;
