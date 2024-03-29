import AggregateRoot from "../Core/Domain/AggregateRoot";
import RevpopAccount from "./ValueObject/RevpopAccount";
import HashLock from "./ValueObject/HashLock";

export default class DepositRequest extends AggregateRoot {
    private _status: number

    constructor(
        private _revpopAccount: RevpopAccount,
        private _hashLock: HashLock
    ) {
        super()
        this._status = 1
    }

    get revpopAccount(): RevpopAccount {
        return this._revpopAccount;
    }

    get hashLock(): HashLock {
        return this._hashLock;
    }

    get status(): number {
        return this._status;
    }

    static create(revpopAccount: RevpopAccount, hashLock: HashLock): DepositRequest {
        const depositRequest = new DepositRequest(revpopAccount, hashLock)

        return depositRequest
    }
}
