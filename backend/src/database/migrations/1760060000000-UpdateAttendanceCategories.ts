import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAttendanceCategories1760060000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add defecation column with the enum type
    await queryRunner.query(`
      CREATE TYPE "defecation_status_enum" AS ENUM ('yes', 'no');
    `);

    await queryRunner.query(`
      ALTER TABLE "attendances"
      ADD COLUMN "defecation" "defecation_status_enum";
    `);

    // No conversion needed for "ate" - values already compatible
    // (ate_all, ate_some, did_not_eat)

    // Update "ate" enum (Snack)
    await queryRunner.query(`
      ALTER TYPE "attendances_ate_enum" RENAME TO "attendances_ate_enum_old";
    `);

    await queryRunner.query(`
      CREATE TYPE "attendances_ate_enum" AS ENUM ('ate_all', 'ate_some', 'did_not_eat');
    `);

    await queryRunner.query(`
      ALTER TABLE "attendances"
      ALTER COLUMN "ate" TYPE "attendances_ate_enum" USING "ate"::text::"attendances_ate_enum";
    `);

    await queryRunner.query(`
      DROP TYPE "attendances_ate_enum_old";
    `);

    // Convert slept values: slept_well -> ate_all, slept_little -> ate_some, did_not_sleep -> did_not_eat
    await queryRunner.query(`
      UPDATE "attendances"
      SET "slept" = (CASE
        WHEN "slept"::text = 'slept_well' THEN 'ate_all'
        WHEN "slept"::text = 'slept_little' THEN 'ate_some'
        WHEN "slept"::text = 'did_not_sleep' THEN 'did_not_eat'
        ELSE 'ate_all'
      END)::"attendances_slept_enum"
      WHERE "slept" IS NOT NULL;
    `);

    // Update "slept" enum (Lunch)
    await queryRunner.query(`
      ALTER TYPE "attendances_slept_enum" RENAME TO "attendances_slept_enum_old";
    `);

    await queryRunner.query(`
      CREATE TYPE "attendances_slept_enum" AS ENUM ('ate_all', 'ate_some', 'did_not_eat');
    `);

    await queryRunner.query(`
      ALTER TABLE "attendances"
      ALTER COLUMN "slept" TYPE "attendances_slept_enum" USING "slept"::text::"attendances_slept_enum";
    `);

    await queryRunner.query(`
      DROP TYPE "attendances_slept_enum_old";
    `);

    // Convert participatedInActivities: participated_fully/participated_partially -> yes, did_not_participate -> no
    await queryRunner.query(`
      UPDATE "attendances"
      SET "participatedInActivities" = (CASE
        WHEN "participatedInActivities"::text IN ('participated_fully', 'participated_partially') THEN 'yes'
        WHEN "participatedInActivities"::text = 'did_not_participate' THEN 'no'
        ELSE 'yes'
      END)::"attendances_participatedinactivities_enum"
      WHERE "participatedInActivities" IS NOT NULL;
    `);

    // Update "participatedInActivities" enum (Urination)
    await queryRunner.query(`
      ALTER TYPE "attendances_participatedinactivities_enum" RENAME TO "attendances_participatedinactivities_enum_old";
    `);

    await queryRunner.query(`
      CREATE TYPE "attendances_participatedinactivities_enum" AS ENUM ('yes', 'no');
    `);

    await queryRunner.query(`
      ALTER TABLE "attendances"
      ALTER COLUMN "participatedInActivities" TYPE "attendances_participatedinactivities_enum" USING "participatedInActivities"::text::"attendances_participatedinactivities_enum";
    `);

    await queryRunner.query(`
      DROP TYPE "attendances_participatedinactivities_enum_old";
    `);

    // Mood values 'happy' and 'tired' are already compatible, no conversion needed
    // Any other values will be handled by the enum update

    // Update mood enum
    await queryRunner.query(`
      ALTER TYPE "attendances_mood_enum" RENAME TO "attendances_mood_enum_old";
    `);

    await queryRunner.query(`
      CREATE TYPE "attendances_mood_enum" AS ENUM ('happy', 'somewhat_happy', 'active', 'tired', 'healthy', 'unwell');
    `);

    await queryRunner.query(`
      ALTER TABLE "attendances"
      ALTER COLUMN "mood" TYPE "attendances_mood_enum" USING "mood"::text::"attendances_mood_enum";
    `);

    await queryRunner.query(`
      DROP TYPE "attendances_mood_enum_old";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove defecation column
    await queryRunner.query(`
      ALTER TABLE "attendances"
      DROP COLUMN "defecation";
    `);

    await queryRunner.query(`
      DROP TYPE "defecation_status_enum";
    `);

    // Revert mood enum changes
    await queryRunner.query(`
      ALTER TYPE "attendances_mood_enum" RENAME TO "attendances_mood_enum_new";
    `);

    await queryRunner.query(`
      CREATE TYPE "attendances_mood_enum" AS ENUM ('happy', 'sad', 'tired', 'energetic', 'calm', 'upset');
    `);

    await queryRunner.query(`
      ALTER TABLE "attendances"
      ALTER COLUMN "mood" TYPE "attendances_mood_enum" USING
        CASE
          WHEN "mood"::text = 'somewhat_happy' THEN 'happy'
          WHEN "mood"::text = 'active' THEN 'energetic'
          WHEN "mood"::text = 'healthy' THEN 'calm'
          WHEN "mood"::text = 'unwell' THEN 'upset'
          ELSE "mood"::text
        END::"attendances_mood_enum";
    `);

    await queryRunner.query(`
      DROP TYPE "attendances_mood_enum_new";
    `);
  }
}
