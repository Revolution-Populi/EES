import ConfirmDepositByBlockchain from "./ConfirmDepositByBlockchain";
import RepositoryInterface from "../../../Domain/RepositoryInterface";
import {Result, Either, right, left} from "../../../../Core";
import {UseCase} from "../../../../Core/Domain/UseCase";
import {UnexpectedError} from "../../../../Core/Logic/AppError";
import {DepositNotFound} from "./Errors";
import Deposit from "../../../Domain/Deposit";
import TxHash from "../../../Domain/TxHash";
import HashLock from "../../../Domain/HashLock";
import TimeLock from "../../../Domain/TimeLock";
import Amount from "../../../Domain/Amount";

type Response = Either<
    UnexpectedError |
    DepositNotFound,
    Result<void>
>

export default class ConfirmDepositByBlockchainHandler implements UseCase<ConfirmDepositByBlockchain, Response> {
    constructor(
        private _repository: RepositoryInterface,
    ) {}

    async execute(command: ConfirmDepositByBlockchain): Promise<Response> {
        const deposit = await this._repository.getByTxHash(command.txHash)
        const amount = Amount.create(command.value)
        const hashLock = HashLock.create(command.hashLock)
        const timeLock = TimeLock.create(command.timeLock)

        if (deposit === null) {
            const txHashOrError = TxHash.create(command.txHash)
            const hashLockOrError = HashLock.create(command.hashLock)

            const combinedPropsResult = Result.combine([txHashOrError, amount, hashLock, timeLock]);

            if (combinedPropsResult.isFailure) {
                return left(Result.fail<void>(combinedPropsResult.error)) as Response;
            }

            const deposit = Deposit.createByBlockchain(
                txHashOrError.getValue() as TxHash,
                amount.getValue() as Amount,
                hashLock.getValue() as HashLock,
                timeLock.getValue() as TimeLock
            )
            await this._repository.create(deposit)

            return right(Result.ok<void>());
        }

        deposit.confirmByBlockchain(
            amount.getValue() as Amount,
            hashLock.getValue() as HashLock,
            timeLock.getValue() as TimeLock
        )

        await this._repository.save(deposit)

        return right(Result.ok<void>());
    }
}