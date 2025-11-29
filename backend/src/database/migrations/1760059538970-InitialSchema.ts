import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1760059538970 implements MigrationInterface {
    name = 'InitialSchema1760059538970'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "color" character varying, "maxStudents" integer, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "teacherId" uuid NOT NULL, CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."attendances_status_enum" AS ENUM('present', 'absent', 'late', 'early_departure')`);
        await queryRunner.query(`CREATE TYPE "public"."attendances_ate_enum" AS ENUM('ate_all', 'ate_some', 'did_not_eat')`);
        await queryRunner.query(`CREATE TYPE "public"."attendances_slept_enum" AS ENUM('slept_well', 'slept_little', 'did_not_sleep')`);
        await queryRunner.query(`CREATE TYPE "public"."attendances_participatedinactivities_enum" AS ENUM('participated_fully', 'participated_partially', 'did_not_participate')`);
        await queryRunner.query(`CREATE TYPE "public"."attendances_mood_enum" AS ENUM('happy', 'sad', 'tired', 'energetic', 'calm', 'upset')`);
        await queryRunner.query(`CREATE TABLE "attendances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "status" "public"."attendances_status_enum" NOT NULL, "checkInTime" TIME, "checkOutTime" TIME, "notes" text, "ate" "public"."attendances_ate_enum", "slept" "public"."attendances_slept_enum", "participatedInActivities" "public"."attendances_participatedinactivities_enum", "mood" "public"."attendances_mood_enum", "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "studentId" uuid NOT NULL, "markedById" uuid NOT NULL, CONSTRAINT "PK_483ed97cd4cd43ab4a117516b69" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_65c32e13378cb75ecbc5615666" ON "attendances" ("studentId", "date") `);
        await queryRunner.query(`CREATE TYPE "public"."activities_type_enum" AS ENUM('meal', 'nap', 'play', 'learning', 'outdoor', 'art', 'music', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."activities_status_enum" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "type" "public"."activities_type_enum" NOT NULL DEFAULT 'other', "status" "public"."activities_status_enum" NOT NULL DEFAULT 'scheduled', "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "notes" text, "batchId" uuid, "studentId" uuid NOT NULL, "assignedById" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."students_gender_enum" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`CREATE TABLE "students" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "birthDate" date NOT NULL, "gender" "public"."students_gender_enum" NOT NULL, "allergies" text, "observations" text, "emergencyContact" character varying, "emergencyPhone" character varying, "photo" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "parentId" uuid NOT NULL, CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."chat_rooms_type_enum" AS ENUM('direct', 'group', 'announcement')`);
        await queryRunner.query(`CREATE TABLE "chat_rooms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "type" "public"."chat_rooms_type_enum" NOT NULL, "avatar" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdById" uuid NOT NULL, CONSTRAINT "PK_c69082bd83bffeb71b0f455bd59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."chat_participants_role_enum" AS ENUM('admin', 'member')`);
        await queryRunner.query(`CREATE TABLE "chat_participants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" "public"."chat_participants_role_enum" NOT NULL DEFAULT 'member', "joinedAt" TIMESTAMP NOT NULL, "leftAt" TIMESTAMP, "chatRoomId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_ebf68c52a2b4dceb777672b782d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."messages_type_enum" AS ENUM('text', 'image', 'file', 'system')`);
        await queryRunner.query(`CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "type" "public"."messages_type_enum" NOT NULL DEFAULT 'text', "attachments" json, "isEdited" boolean NOT NULL DEFAULT false, "editedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "senderId" uuid NOT NULL, "chatRoomId" uuid NOT NULL, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "message_reads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "readAt" TIMESTAMP NOT NULL, "messageId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_7d3be462a9d7dfbbccc93c097e1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."calendar_events_type_enum" AS ENUM('class', 'meal', 'nap', 'activity', 'meeting', 'event', 'holiday')`);
        await queryRunner.query(`CREATE TYPE "public"."calendar_events_status_enum" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "calendar_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "allDay" boolean NOT NULL DEFAULT false, "type" "public"."calendar_events_type_enum" NOT NULL, "status" "public"."calendar_events_status_enum" NOT NULL DEFAULT 'scheduled', "location" character varying, "metadata" json, "googleEventId" character varying, "outlookEventId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdById" uuid NOT NULL, CONSTRAINT "PK_faf5391d232322a87cdd1c6f30c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."event_participants_participanttype_enum" AS ENUM('user', 'student', 'group')`);
        await queryRunner.query(`CREATE TYPE "public"."event_participants_status_enum" AS ENUM('invited', 'accepted', 'declined')`);
        await queryRunner.query(`CREATE TABLE "event_participants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "participantId" character varying NOT NULL, "participantType" "public"."event_participants_participanttype_enum" NOT NULL, "status" "public"."event_participants_status_enum" NOT NULL DEFAULT 'invited', "respondedAt" TIMESTAMP, "eventId" uuid NOT NULL, CONSTRAINT "PK_b65ffd558d76fd51baffe81d42b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'teacher', 'parent')`);
        await queryRunner.query(`CREATE TYPE "public"."users_authprovider_enum" AS ENUM('local', 'google', 'facebook')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "password" character varying, "role" "public"."users_role_enum" NOT NULL, "authProvider" "public"."users_authprovider_enum" NOT NULL DEFAULT 'local', "googleId" character varying, "facebookId" character varying, "phone" character varying, "avatar" character varying, "isActive" boolean NOT NULL DEFAULT true, "emailVerified" boolean NOT NULL DEFAULT false, "mustChangePassword" boolean NOT NULL DEFAULT false, "preferences" json, "resetPasswordToken" character varying, "resetPasswordExpires" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "group_students" ("groupId" uuid NOT NULL, "studentId" uuid NOT NULL, CONSTRAINT "PK_9ebf1896c04afe06595504b178c" PRIMARY KEY ("groupId", "studentId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_db9a438a218989ecaa69acc225" ON "group_students" ("groupId") `);
        await queryRunner.query(`CREATE INDEX "IDX_673797eb80fe17fe53d74ae049" ON "group_students" ("studentId") `);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_e63173ac43b478c2fc0cc20ac39" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_615b414059091a9a8ea0355ae89" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendances" ADD CONSTRAINT "FK_d3e8821145edf7a44469bfe391a" FOREIGN KEY ("markedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_ec90e2451d990c6bf0d3a68e9c1" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_a82218b9c8b2481239ce8b30507" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_6fea943b3b432a9e3e38d53c31b" FOREIGN KEY ("parentId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_rooms" ADD CONSTRAINT "FK_8e4fbc0dfa5e3ef7b7c4e65ea5d" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_participants" ADD CONSTRAINT "FK_978ef4a854c212ede69dfe56779" FOREIGN KEY ("chatRoomId") REFERENCES "chat_rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_participants" ADD CONSTRAINT "FK_fb6add83b1a7acc94433d385692" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_05cc073f1a70e468e3ee1b4ba98" FOREIGN KEY ("chatRoomId") REFERENCES "chat_rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message_reads" ADD CONSTRAINT "FK_52bbdda5d68282f2b13b605dbf0" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message_reads" ADD CONSTRAINT "FK_d73adf0e3689c233a1aceea2ffa" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "calendar_events" ADD CONSTRAINT "FK_6ad6ef11e78d4127be50a9268cb" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_participants" ADD CONSTRAINT "FK_4907f15416577c3bbbcd604d121" FOREIGN KEY ("eventId") REFERENCES "calendar_events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_students" ADD CONSTRAINT "FK_db9a438a218989ecaa69acc225e" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "group_students" ADD CONSTRAINT "FK_673797eb80fe17fe53d74ae049b" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "group_students" DROP CONSTRAINT "FK_673797eb80fe17fe53d74ae049b"`);
        await queryRunner.query(`ALTER TABLE "group_students" DROP CONSTRAINT "FK_db9a438a218989ecaa69acc225e"`);
        await queryRunner.query(`ALTER TABLE "event_participants" DROP CONSTRAINT "FK_4907f15416577c3bbbcd604d121"`);
        await queryRunner.query(`ALTER TABLE "calendar_events" DROP CONSTRAINT "FK_6ad6ef11e78d4127be50a9268cb"`);
        await queryRunner.query(`ALTER TABLE "message_reads" DROP CONSTRAINT "FK_d73adf0e3689c233a1aceea2ffa"`);
        await queryRunner.query(`ALTER TABLE "message_reads" DROP CONSTRAINT "FK_52bbdda5d68282f2b13b605dbf0"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_05cc073f1a70e468e3ee1b4ba98"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce"`);
        await queryRunner.query(`ALTER TABLE "chat_participants" DROP CONSTRAINT "FK_fb6add83b1a7acc94433d385692"`);
        await queryRunner.query(`ALTER TABLE "chat_participants" DROP CONSTRAINT "FK_978ef4a854c212ede69dfe56779"`);
        await queryRunner.query(`ALTER TABLE "chat_rooms" DROP CONSTRAINT "FK_8e4fbc0dfa5e3ef7b7c4e65ea5d"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_6fea943b3b432a9e3e38d53c31b"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_a82218b9c8b2481239ce8b30507"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_ec90e2451d990c6bf0d3a68e9c1"`);
        await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT "FK_d3e8821145edf7a44469bfe391a"`);
        await queryRunner.query(`ALTER TABLE "attendances" DROP CONSTRAINT "FK_615b414059091a9a8ea0355ae89"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_e63173ac43b478c2fc0cc20ac39"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_673797eb80fe17fe53d74ae049"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_db9a438a218989ecaa69acc225"`);
        await queryRunner.query(`DROP TABLE "group_students"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_authprovider_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "event_participants"`);
        await queryRunner.query(`DROP TYPE "public"."event_participants_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."event_participants_participanttype_enum"`);
        await queryRunner.query(`DROP TABLE "calendar_events"`);
        await queryRunner.query(`DROP TYPE "public"."calendar_events_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."calendar_events_type_enum"`);
        await queryRunner.query(`DROP TABLE "message_reads"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TYPE "public"."messages_type_enum"`);
        await queryRunner.query(`DROP TABLE "chat_participants"`);
        await queryRunner.query(`DROP TYPE "public"."chat_participants_role_enum"`);
        await queryRunner.query(`DROP TABLE "chat_rooms"`);
        await queryRunner.query(`DROP TYPE "public"."chat_rooms_type_enum"`);
        await queryRunner.query(`DROP TABLE "students"`);
        await queryRunner.query(`DROP TYPE "public"."students_gender_enum"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`DROP TYPE "public"."activities_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."activities_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_65c32e13378cb75ecbc5615666"`);
        await queryRunner.query(`DROP TABLE "attendances"`);
        await queryRunner.query(`DROP TYPE "public"."attendances_mood_enum"`);
        await queryRunner.query(`DROP TYPE "public"."attendances_participatedinactivities_enum"`);
        await queryRunner.query(`DROP TYPE "public"."attendances_slept_enum"`);
        await queryRunner.query(`DROP TYPE "public"."attendances_ate_enum"`);
        await queryRunner.query(`DROP TYPE "public"."attendances_status_enum"`);
        await queryRunner.query(`DROP TABLE "groups"`);
    }

}
