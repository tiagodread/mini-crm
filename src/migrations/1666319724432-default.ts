import { MigrationInterface, QueryRunner } from "typeorm";

export class default1666319724432 implements MigrationInterface {
    name = 'default1666319724432'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_reset_expires" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_reset_expires" SET DEFAULT now()`);
    }

}
