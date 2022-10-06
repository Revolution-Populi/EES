import {Result} from "../../../Core";
import {UseCaseError} from "../../../Core/Logic/UseCaseError";

export class RevpopApiError extends Result<UseCaseError> {
    constructor(
        txHash: string,
        message: string
    ) {
        super(false, {
            message,
        } as UseCaseError)
    }

    static create(txHash: string, message: string): RevpopApiError {
        return new RevpopApiError(txHash, message)
    }
}