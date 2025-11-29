import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStudentMediaModule1760070000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create media_type enum
    await queryRunner.query(`
      CREATE TYPE "media_type_enum" AS ENUM ('photo', 'document');
    `);

    // Create student_media table
    await queryRunner.query(`
      CREATE TABLE "student_media" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "fileName" character varying NOT NULL,
        "originalFileName" character varying NOT NULL,
        "fileUrl" character varying NOT NULL,
        "fileKey" character varying NOT NULL,
        "mediaType" "media_type_enum" NOT NULL,
        "mimeType" character varying NOT NULL,
        "fileSize" bigint NOT NULL,
        "description" text,
        "uploadedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "uploadedById" uuid,
        CONSTRAINT "PK_student_media" PRIMARY KEY ("id")
      );
    `);

    // Create join table for many-to-many relationship between student_media and students
    await queryRunner.query(`
      CREATE TABLE "student_media_students" (
        "studentMediaId" uuid NOT NULL,
        "studentId" uuid NOT NULL,
        CONSTRAINT "PK_student_media_students" PRIMARY KEY ("studentMediaId", "studentId")
      );
    `);

    // Create indexes for the join table
    await queryRunner.query(`
      CREATE INDEX "IDX_student_media_students_media" ON "student_media_students" ("studentMediaId");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_student_media_students_student" ON "student_media_students" ("studentId");
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "student_media"
      ADD CONSTRAINT "FK_student_media_uploadedBy"
      FOREIGN KEY ("uploadedById")
      REFERENCES "users"("id")
      ON DELETE SET NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "student_media_students"
      ADD CONSTRAINT "FK_student_media_students_media"
      FOREIGN KEY ("studentMediaId")
      REFERENCES "student_media"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE "student_media_students"
      ADD CONSTRAINT "FK_student_media_students_student"
      FOREIGN KEY ("studentId")
      REFERENCES "students"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_student_media_uploadedById" ON "student_media" ("uploadedById");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_student_media_mediaType" ON "student_media" ("mediaType");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_student_media_uploadedAt" ON "student_media" ("uploadedAt");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "student_media_students"
      DROP CONSTRAINT "FK_student_media_students_student";
    `);

    await queryRunner.query(`
      ALTER TABLE "student_media_students"
      DROP CONSTRAINT "FK_student_media_students_media";
    `);

    await queryRunner.query(`
      ALTER TABLE "student_media"
      DROP CONSTRAINT "FK_student_media_uploadedBy";
    `);

    // Drop indexes
    await queryRunner.query(`
      DROP INDEX "IDX_student_media_uploadedAt";
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_student_media_mediaType";
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_student_media_uploadedById";
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_student_media_students_student";
    `);

    await queryRunner.query(`
      DROP INDEX "IDX_student_media_students_media";
    `);

    // Drop tables
    await queryRunner.query(`
      DROP TABLE "student_media_students";
    `);

    await queryRunner.query(`
      DROP TABLE "student_media";
    `);

    // Drop enum type
    await queryRunner.query(`
      DROP TYPE "media_type_enum";
    `);
  }
}
