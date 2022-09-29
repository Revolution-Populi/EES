import {Result} from "../../../../Core";
import {UseCaseError} from "../../../../Core/Logic/UseCaseError";

export class DepositNotFound extends Result<UseCaseError> {
    constructor(txHash: string) {
        super(false, {
            message: `The deposit with tx_hash: ${txHash} was not found.`
        } as UseCaseError)
    }
}

export class DepositCanNotBeProcess extends Result<UseCaseError> {
    constructor(txHash: string) {
        super(false, {
            message: `The deposit with tx_hash: ${txHash} can't be process. Can't create contract in revpop blockchain.`
        } as UseCaseError)
    }
}