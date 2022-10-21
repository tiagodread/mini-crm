import { MigrationInterface, QueryRunner } from "typeorm";

export class default1666319692051 implements MigrationInterface {
    name = 'default1666319692051'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_reset_expires" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_reset_expires" SET NOT NULL`);
    }

}
