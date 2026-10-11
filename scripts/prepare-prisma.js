const fs = require('fs');
const path = require('path');

const prismaDir = path.join(__dirname, '..', 'prisma');
const schemaPath = path.join(prismaDir, 'schema.prisma');
const pgSchemaPath = path.join(prismaDir, 'schema.postgresql.prisma');
const sqliteSchemaPath = path.join(prismaDir, 'schema.sqlite.prisma');

const dbUrl = (process.env.DATABASE_URL || '').trim();

if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
  console.log('⚡ Prisma Builder: PostgreSQL target detected (Neon / Production). Activating PostgreSQL schema.');
  if (fs.existsSync(pgSchemaPath)) {
    fs.copyFileSync(pgSchemaPath, schemaPath);
    console.log('✅ Synchronized prisma/schema.prisma -> PostgreSQL');
  } else {
    console.error('❌ PostgreSQL schema file missing at:', pgSchemaPath);
    process.exit(1);
  }
} else {
  console.log('⚡ Prisma Builder: SQLite target detected (Local development). Activating SQLite schema.');
  if (fs.existsSync(sqliteSchemaPath)) {
    fs.copyFileSync(sqliteSchemaPath, schemaPath);
    console.log('✅ Synchronized prisma/schema.prisma -> SQLite');
  } else {
    console.error('❌ SQLite schema file missing at:', sqliteSchemaPath);
    process.exit(1);
  }
}
