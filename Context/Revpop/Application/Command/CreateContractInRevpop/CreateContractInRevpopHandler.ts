import Web3 from "web3";
import CreateContractInRevpop from "./CreateContractInRevpop";
import RepositoryInterface from "../../../Domain/RepositoryInterface";
import {Result, Either, right, left} from "../../../../Core";
import {UseCase} from "../../../../Core/Domain/UseCase";
import {UnexpectedError} from "../../../../Core/Logic/AppError";
import {DepositCanNotBeProcess, DepositNotFound} from "./Errors";
import {RedeemUnexpectedError} from "../../../Domain/Errors";
import BlockchainApiInterface from "../../../Domain/BlockchainApiInterface";

type Response = Either<
    UnexpectedError | DepositNotFound | RedeemUnexpectedError,
    Result<void>
    >

export default class CreateContractInRevpopHandler implements UseCase<CreateContractInRevpop, Response> {
    constructor(
        private _repository: RepositoryInterface,
        private _blockchainApi: BlockchainApiInterface
    ) {}

    async execute(command: CreateContractInRevpop): Promise<Response> {
        const deposit = await this._repository.getByTxHash(command.txHash)

        if (deposit === null) {
            return left(new DepositNotFound(command.txHash));
        }

        if (deposit.value === null || deposit.revpopAccount === null) {
            return left(new DepositCanNotBeProcess(command.txHash));
        }

        //Start create contract in revpop
        const issueAssetResult = await this._blockchainApi.issueAsset(deposit.value, deposit.revpopAccount.value)
        console.log(issueAssetResult)

        const revpopContractId = Web3.utils.randomHex(16)
        //End create contract in revpop

        deposit.createInRevpopBlockchain(revpopContractId)

        await this._repository.save(deposit)

        return right(Result.ok<void>());
    }
}