import {DataSource} from 'typeorm';
import DepositRepositoryInterface from '../../Domain/DepositRepositoryInterface';
import Deposit from '../../Domain/Deposit';

export default class TypeOrmRepository implements DepositRepositoryInterface {
    constructor(
        private _datasource: DataSource
    ) {}

    async create(deposit: Deposit) {
        await this._datasource.getRepository<Deposit>(Deposit).save(deposit)
    }

    async save(deposit: Deposit) {
        await this._datasource.getRepository<Deposit>(Deposit).upsert(deposit, ['id'])
    }

    async exists(contractId: string): Promise<boolean> {
        const count = await this._datasource
            .getRepository<Deposit>(Deposit)
            .createQueryBuilder('deposit')
            .leftJoinAndSelect('deposit._externalContract', 'externalContract')
            .where('externalContract.id = :contractId', { contractId: contractId })
            .getCount()

        return count > 0;
    }

    async getById(id: string): Promise<Deposit | null> {
        return await this._datasource
            .getRepository<Deposit>(Deposit)
            .createQueryBuilder('deposit')
            .leftJoinAndSelect('deposit._externalContract', 'externalContract')
            .leftJoinAndSelect('deposit._depositRequest', 'depositRequest')
            .where('deposit.id = :depositId', {depositId: id})
            .getOne()
    }
}
