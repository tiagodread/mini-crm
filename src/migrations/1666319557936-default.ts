import { MigrationInterface, QueryRunner } from "typeorm";

export class default1666319557936 implements MigrationInterface {
    name = 'default1666319557936'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_reset_token" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_reset_token" SET NOT NULL`);
    }

}
