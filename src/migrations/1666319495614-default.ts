import { MigrationInterface, QueryRunner } from "typeorm";

export class default1666319495614 implements MigrationInterface {
    name = 'default1666319495614'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "videos" ("id" SERIAL NOT NULL, "title" text NOT NULL, "url" text, "room_id" integer, CONSTRAINT "PK_e4c86c0cf95aff16e9fb8220f6b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "rooms" ("id" SERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subjects" ("id" SERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "PK_1a023685ac2b051b4e557b0b280" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "email" text NOT NULL, "password" text, "password_reset_token" text NOT NULL, "password_reset_expires" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "room_subject" ("room_id" integer NOT NULL, "subject_id" integer NOT NULL, CONSTRAINT "PK_6b3738a7b93c77fd6d9333b638a" PRIMARY KEY ("room_id", "subject_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f227421d2ef64ab086261ac07f" ON "room_subject" ("room_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a05f10c497f5f7db3022664a6d" ON "room_subject" ("subject_id") `);
        await queryRunner.query(`ALTER TABLE "videos" ADD CONSTRAINT "FK_64bb2d8544299bbde670698ac37" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room_subject" ADD CONSTRAINT "FK_f227421d2ef64ab086261ac07fd" FOREIGN KEY ("room_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "room_subject" ADD CONSTRAINT "FK_a05f10c497f5f7db3022664a6d6" FOREIGN KEY ("subject_id") REFERENCES "rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room_subject" DROP CONSTRAINT "FK_a05f10c497f5f7db3022664a6d6"`);
        await queryRunner.query(`ALTER TABLE "room_subject" DROP CONSTRAINT "FK_f227421d2ef64ab086261ac07fd"`);
        await queryRunner.query(`ALTER TABLE "videos" DROP CONSTRAINT "FK_64bb2d8544299bbde670698ac37"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a05f10c497f5f7db3022664a6d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f227421d2ef64ab086261ac07f"`);
        await queryRunner.query(`DROP TABLE "room_subject"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "subjects"`);
        await queryRunner.query(`DROP TABLE "rooms"`);
        await queryRunner.query(`DROP TABLE "videos"`);
    }

}
