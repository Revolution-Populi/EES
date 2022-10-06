import CreateContractInRevpop from "./CreateContractInRevpop";
import RepositoryInterface from "../../../Domain/RepositoryInterface";
import {Result, Either, right, left} from "../../../../Core";
import {UseCase} from "../../../../Core/Domain/UseCase";
import {UnexpectedError} from "../../../../Core/Logic/AppError";
import {DepositCanNotBeProcess, DepositNotFound} from "./Errors";
import {RedeemUnexpectedError} from "../../../Domain/Errors";
import BlockchainApiInterface from "../../../Domain/BlockchainApiInterface";
import {RevpopApiError} from "../../../Infrastructure/BlockchainApi/Errors";
import ConverterInterface from "../../../Domain/ConverterInterface";

type Response = Either<
    UnexpectedError | DepositNotFound | RedeemUnexpectedError,
    Result<void>
    >

export default class CreateContractInRevpopHandler implements UseCase<CreateContractInRevpop, Response> {
    constructor(
        private _repository: RepositoryInterface,
        private _converter: ConverterInterface,
        private _blockchainApi: BlockchainApiInterface
    ) {}

    async execute(command: CreateContractInRevpop): Promise<Response> {
        const deposit = await this._repository.getByTxHash(command.txHash)

        if (deposit === null) {
            return left(new DepositNotFound(command.txHash));
        }

        if (deposit.value === null || deposit.revpopAccount === null || deposit.timeLock === null) {
            return left(new DepositCanNotBeProcess(command.txHash));
        }

        const rvEthAmount = this._converter.convert(deposit.value.value)

        const revpopContractId = await this._blockchainApi.createContract(
            deposit.revpopAccount.value,
            rvEthAmount,
            deposit.hashLock.value.substring(2),
            deposit.timeLock.value
        )

        if (!revpopContractId) {
            return left(RevpopApiError.create(command.txHash, 'Error while create contract'))
        }

        deposit.createInRevpopBlockchain(revpopContractId)

        await this._repository.save(deposit)

        return right(Result.ok<void>());
    }
}