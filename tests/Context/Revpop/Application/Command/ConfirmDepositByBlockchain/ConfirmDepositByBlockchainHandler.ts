import {expect} from 'chai';
import dayjs from "dayjs";
import StubRepository from '../../../../../../Context/Revpop/Infrastructure/StubRepository';
import {ConfirmDepositByBlockchain} from '../../../../../../Context/Revpop';
import ConfirmDepositByBlockchainHandler
    from '../../../../../../Context/Revpop/Application/Command/ConfirmDepositByBlockchain/ConfirmDepositByBlockchainHandler';
import Deposit from '../../../../../../Context/Revpop/Domain/Deposit';
import TxHash from '../../../../../../Context/Revpop/Domain/TxHash';
import RevpopAccount from '../../../../../../Context/Revpop/Domain/RevpopAccount';
import DepositConfirmedEvent from "../../../../../../Context/Revpop/Domain/Event/DepositConfirmedEvent";
import HashLock from "../../../../../../Context/Revpop/Domain/HashLock";

describe('Revpop::ConfirmDepositByBlockchainHandler', () => {
    let repository: StubRepository;
    let handler: ConfirmDepositByBlockchainHandler;

    beforeEach(function() {
        repository = new StubRepository()
        handler = new ConfirmDepositByBlockchainHandler(repository);
    });

    describe('execute', () => {
        const txHash = '0x2592cf699903e83bfd664aa4e339388fd044fe31643a85037be803a5d162729f'
        const revpopAccount = 'revpop_account'
        const amount = '1000'
        const hashLock = '0x14383da019a0dafdf459d62c6f9c1aaa9e4d0f16554b5c493e85eb4a3dfac55c'
        const timeLock = dayjs().add(1, 'month').unix()

        describe('deposit is created by user', () => {
            let deposit: Deposit

            beforeEach(async () => {
                deposit = Deposit.createByUser(
                    TxHash.create(txHash).getValue() as TxHash,
                    RevpopAccount.create(revpopAccount).getValue() as RevpopAccount,
                    HashLock.create(hashLock).getValue() as RevpopAccount
                )
                await repository.create(deposit)
            })

            it('should confirm deposit', async () => {
                const command = new ConfirmDepositByBlockchain(txHash, amount, hashLock, timeLock)
                const result = await handler.execute(command)

                expect(result.isRight()).true
            });

            it('should have correct contract data', async () => {
                const command = new ConfirmDepositByBlockchain(txHash, amount, hashLock, timeLock)
                const result = await handler.execute(command)

                expect(result.isRight()).true

                const deposit = await repository.getByTxHash(txHash)

                expect(deposit?.value?.value).equals(amount)
                expect(deposit?.hashLock.value).equals(hashLock)
                expect(deposit?.timeLock?.value).equals(timeLock)
                expect(deposit?.revpopAccount?.value).equals(revpopAccount)
            });

            it('DepositConfirmedEvent should be added', async () => {
                const command = new ConfirmDepositByBlockchain(txHash, amount, hashLock, timeLock)

                await handler.execute(command)

                expect(deposit.domainEvents).length(1)
                expect(deposit.domainEvents[0]).instanceof(DepositConfirmedEvent)
            });
        })

        describe('deposit is not created by user', () => {
            it('should create new deposit', async () => {
                const command = new ConfirmDepositByBlockchain(txHash, amount, hashLock, timeLock)

                const result = await handler.execute(command)

                expect(result.isLeft(), result.value.error?.message).false
                expect(result.isRight()).true
                expect(repository.size).equals(1)
            });

            it('should have correct contract data', async () => {
                const command = new ConfirmDepositByBlockchain(txHash, amount, hashLock, timeLock)
                const result = await handler.execute(command)

                expect(result.isLeft()).false
                expect(result.isRight()).true

                const deposit = await repository.getByTxHash(txHash)
                expect(deposit?.value?.value).equals(amount)
                expect(deposit?.hashLock.value).equals(hashLock)
                expect(deposit?.timeLock?.value).equals(timeLock)
                expect(deposit?.revpopAccount).null
            });

            it('DepositConfirmedEvent should not be added ', async () => {
                const command = new ConfirmDepositByBlockchain(txHash, '1000', hashLock, timeLock)
                await handler.execute(command)

                const deposit = await repository.getByTxHash(txHash)
                expect(deposit?.domainEvents).empty
            });
        })
    });
});
