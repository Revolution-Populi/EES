import { MigrationInterface, QueryRunner } from "typeorm";

export class addTimeLock1665051261679 implements MigrationInterface {
    name = 'addTimeLock1665051261679'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`deposit\` ADD \`time_lock\` int NULL AFTER \`hash_lock\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`deposit\` DROP COLUMN \`time_lock\``);
    }

}
