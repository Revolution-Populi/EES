import {expect} from 'chai';
import dayjs from "dayjs";
import StubRepository from '../../../../../../Context/Revpop/Infrastructure/StubRepository';
import Deposit from "../../../../../../Context/Revpop/Domain/Deposit";
import TxHash from "../../../../../../Context/Revpop/Domain/TxHash";
import Amount from "../../../../../../Context/Revpop/Domain/Amount";
import HashLock from "../../../../../../Context/Revpop/Domain/HashLock";
import TimeLock from "../../../../../../Context/Revpop/Domain/TimeLock";
import RevpopAccount from "../../../../../../Context/Revpop/Domain/RevpopAccount";
import {CreateContractInRevpop} from "../../../../../../Context/Revpop";
import CreateContractInRevpopHandler
    from "../../../../../../Context/Revpop/Application/Command/CreateContractInRevpop/CreateContractInRevpopHandler";
import {
    DepositCanNotBeProcess,
    DepositNotFound
} from "../../../../../../Context/Revpop/Application/Command/CreateContractInRevpop/Errors";
import StubBlockchainApi from "../../../../../../Context/Revpop/Infrastructure/BlockchainApi/Stub";
import Converter from "../../../../../../Context/Revpop/Infrastructure/Converter";
import {RevpopApiError} from "../../../../../../Context/Revpop/Infrastructure/BlockchainApi/Errors";

describe('Revpop::CreateContractInRevpop', () => {
    let repository: StubRepository;
    let converter: Converter;
    let blockchainApi: StubBlockchainApi;
    let handler: CreateContractInRevpopHandler;
    const txHash = '0x2592cf699903e83bfd664aa4e339388fd044fe31643a85037be803a5d162729f'
    const hashLock = '0x14383da019a0dafdf459d62c6f9c1aaa9e4d0f16554b5c493e85eb4a3dfac55c'
    const timeLock = dayjs().add(1, 'week').unix()

    beforeEach(function() {
        repository = new StubRepository()
        converter = new Converter()
        blockchainApi = new StubBlockchainApi()
        handler = new CreateContractInRevpopHandler(repository, converter, blockchainApi);
    });

    describe('execute', () => {
        describe('without errors', async () => {
            it('should create contract in Revpop blockchain', async () => {
                const deposit = Deposit.createByBlockchain(
                    TxHash.create(txHash).getValue() as TxHash,
                    Amount.create('100000000000000000').getValue() as Amount,
                    HashLock.create(hashLock).getValue() as HashLock,
                    TimeLock.create(timeLock).getValue() as TimeLock
                )
                deposit.confirmByUser(RevpopAccount.create('init11').getValue() as RevpopAccount)
                await repository.create(deposit)

                const command = new CreateContractInRevpop(deposit.txHash.value)
                const result = await handler.execute(command)

                expect(result.isRight(), result.value.error?.message).true
                expect(deposit.revpopContractId).not.empty
            });
        })

        describe('with errors', async () => {
            it('should return an error if deposit was not found', async () => {
                const command = new CreateContractInRevpop('revpop_contract_id')
                const result = await handler.execute(command)

                expect(result.isLeft()).true
                expect(result.value).instanceof(DepositNotFound)
            })

            it('should return an error if amount or revpopAccount is not set', async () => {
                const deposit = Deposit.createByBlockchain(
                    TxHash.create(txHash).getValue() as TxHash,
                    Amount.create('100000000000000000').getValue() as Amount,
                    HashLock.create(hashLock).getValue() as HashLock,
                    TimeLock.create(timeLock).getValue() as TimeLock
                )
                await repository.create(deposit)

                const command = new CreateContractInRevpop(txHash)
                const result = await handler.execute(command)

                expect(result.isLeft()).true
                expect(result.value).instanceof(DepositCanNotBeProcess)
            })

            it('should return an error if revpop API error occurred', async () => {
                const deposit = Deposit.createByBlockchain(
                    TxHash.create(txHash).getValue() as TxHash,
                    Amount.create('100000000000000000').getValue() as Amount,
                    HashLock.create(hashLock).getValue() as HashLock,
                    TimeLock.create(timeLock).getValue() as TimeLock
                )
                deposit.confirmByUser(RevpopAccount.create('init11').getValue() as RevpopAccount)
                await repository.create(deposit)

                blockchainApi.returnError()

                const command = new CreateContractInRevpop(txHash)
                const result = await handler.execute(command)

                expect(result.isLeft()).true
                expect(result.value).instanceof(RevpopApiError)
            })
        })
    });
});
