import {expect} from 'chai';
import dayjs from "dayjs";
import StubRepository from '../../../../../../Context/Revpop/Infrastructure/StubRepository';
import RedeemDepositHandler
    from "../../../../../../Context/Revpop/Application/Command/RedeemDeposit/RedeemDepositHandler";
import Deposit from "../../../../../../Context/Revpop/Domain/Deposit";
import TxHash from "../../../../../../Context/Revpop/Domain/TxHash";
import Amount from "../../../../../../Context/Revpop/Domain/Amount";
import HashLock from "../../../../../../Context/Revpop/Domain/HashLock";
import TimeLock from "../../../../../../Context/Revpop/Domain/TimeLock";
import {RedeemDeposit} from "../../../../../../Context/Revpop";
import {DepositNotFound} from "../../../../../../Context/Revpop/Application/Command/RedeemDeposit/Errors";
import RevpopAccount from "../../../../../../Context/Revpop/Domain/RevpopAccount";

describe('Revpop::RedeemDepositHandler', () => {
    let repository: StubRepository;
    let handler: RedeemDepositHandler;
    const txHash = '0x2592cf699903e83bfd664aa4e339388fd044fe31643a85037be803a5d162729f'
    const hashLock = '0x14383da019a0dafdf459d62c6f9c1aaa9e4d0f16554b5c493e85eb4a3dfac55c'
    const timeLock = dayjs().add(1, 'month').unix()

    beforeEach(function() {
        repository = new StubRepository()
        handler = new RedeemDepositHandler(repository);
    });

    describe('execute', () => {
        describe('without errors', async () => {
            it('should redeem deposit', async () => {
                const deposit = Deposit.createByBlockchain(
                    TxHash.create(txHash).getValue() as TxHash,
                    Amount.create('1000').getValue() as Amount,
                    HashLock.create(hashLock).getValue() as HashLock,
                    TimeLock.create(timeLock).getValue() as TimeLock
                )
                deposit.confirmByUser(RevpopAccount.create('revpop_account').getValue() as RevpopAccount)
                deposit.createInRevpopBlockchain('revpop_contract_id')
                await repository.create(deposit)

                const command = new RedeemDeposit('revpop_contract_id')
                const result = await handler.execute(command)

                expect(result.isRight(), result.value.error?.message).true
            })
        })

        describe('with errors', async () => {
            it('should return error if deposit was not found', async () => {
                const command = new RedeemDeposit('revpop_contract_id')
                const result = await handler.execute(command)

                expect(result.isLeft()).true
                expect(result.value).instanceof(DepositNotFound)
            })
        })
    });
});
