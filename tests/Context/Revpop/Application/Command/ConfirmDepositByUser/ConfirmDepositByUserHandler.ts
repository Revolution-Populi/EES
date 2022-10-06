import {expect} from 'chai';
import dayjs from "dayjs";
import StubRepository from '../../../../../../Context/Revpop/Infrastructure/StubRepository';
import ConfirmDepositByUser
    from '../../../../../../Context/Revpop/Application/Command/ConfirmDepositByUser/ConfirmDepositByUser';
import ConfirmDepositByUserHandler from '../../../../../../Context/Revpop/Application/Command/ConfirmDepositByUser/ConfirmDepositByUserHandler';
import Deposit from '../../../../../../Context/Revpop/Domain/Deposit';
import TxHash from '../../../../../../Context/Revpop/Domain/TxHash';
import DepositConfirmedEvent from '../../../../../../Context/Revpop/Domain/Event/DepositConfirmedEvent';
import HashLock from "../../../../../../Context/Revpop/Domain/HashLock";
import TimeLock from "../../../../../../Context/Revpop/Domain/TimeLock";
import Amount from "../../../../../../Context/Revpop/Domain/Amount";

describe('Revpop::ConfirmDepositByUserHandler', () => {
    let repository: StubRepository;
    let handler: ConfirmDepositByUserHandler;
    const amount = '1000'
    const txHash = '0x2592cf699903e83bfd664aa4e339388fd044fe31643a85037be803a5d162729f'
    const hashLock = '0x14383da019a0dafdf459d62c6f9c1aaa9e4d0f16554b5c493e85eb4a3dfac55c'
    const timeLock = dayjs().add(1, 'month').unix()

    beforeEach(function() {
        repository = new StubRepository()
        handler = new ConfirmDepositByUserHandler(repository);
    });

    describe('execute', () => {
        describe('deposit is not created by blockchain', () => {
            it('should create new deposit', async () => {
                const command = new ConfirmDepositByUser(txHash,'revpopAccount', hashLock)
                const depositOrError = await handler.execute(command)

                expect(depositOrError.isLeft()).false
                expect(depositOrError.isRight()).true
                expect(repository.size).equals(1)
            });

            it('DepositConfirmedEvent should not be added ', async () => {
                const command = new ConfirmDepositByUser(txHash, 'revpopAccount', hashLock)
                await handler.execute(command)

                const deposit = await repository.getByTxHash(txHash)
                expect(deposit?.domainEvents).empty
            });
        })

        describe('deposit is created by blockchain', () => {
            let deposit: Deposit

            beforeEach(async () => {
                deposit = Deposit.createByBlockchain(
                    TxHash.create(txHash).getValue() as TxHash,
                    Amount.create(amount).getValue() as Amount,
                    HashLock.create(hashLock).getValue() as HashLock,
                    TimeLock.create(timeLock).getValue() as TimeLock
                )
                await repository.create(deposit)
            })

            it('should confirm deposit', async () => {
                const command = new ConfirmDepositByUser(txHash,'revpopAccount', hashLock)
                const result = await handler.execute(command)

                expect(result.isRight()).true

                expect(deposit.revpopAccount?.value).equals('revpopAccount')
            });

            it('DepositConfirmedEvent should be added', async () => {
                const command = new ConfirmDepositByUser(txHash,'revpopAccount', hashLock)
                await handler.execute(command)

                expect(deposit.domainEvents).length(1)
                expect(deposit.domainEvents[0]).instanceof(DepositConfirmedEvent)
            });
        })
    });
});
