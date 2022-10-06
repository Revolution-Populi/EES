import AggregateRoot from "../../Core/Domain/AggregateRoot";
import UniqueEntityID from "../../Core/Domain/UniqueEntityID";
import TxHash from "./TxHash";
import RevpopAccount from "./RevpopAccount";
import Amount from "./Amount";
import HashLock from "./HashLock";
import TimeLock from "./TimeLock";
import DepositConfirmedEvent from "./Event/DepositConfirmedEvent";
import {Either, left, Result, right} from "../../Core";
import {
    CreateInRevpopBlockchainUnexpectedError,
    RedeemUnexpectedError
} from "./Errors";
import DepositRedeemedEvent from "./Event/DepositRedeemedEvent";

enum STATUS {
    CREATED_BY_USER = 1,
    CREATED_BY_BLOCKCHAIN = 2,
    CONFIRMED = 6,
    CREATED_IN_REVPOP = 10,
    REDEEMED = 15
}

export default class Deposit extends AggregateRoot {
    private _revpopContractId: string | null = null;

    constructor(
        private _txHash: TxHash,
        private _status: number,
        private _value: Amount | null,
        private _hashLock: HashLock,
        private _timeLock: TimeLock | null,
        private _revpopAccount: RevpopAccount | null,
        id?: UniqueEntityID
    ) {
        super(id)
    }

    get txHash(): TxHash {
        return this._txHash
    }

    get value(): Amount | null {
        return this._value;
    }

    get hashLock(): HashLock {
        return this._hashLock
    }

    get timeLock(): TimeLock | null {
        return this._timeLock
    }

    get revpopAccount(): RevpopAccount | null {
        return this._revpopAccount;
    }

    get revpopContractId(): string | null {
        return this._revpopContractId;
    }

    confirmByUser(revpopAccount: RevpopAccount) {
        this._revpopAccount = revpopAccount

        if (this._status === STATUS.CREATED_BY_BLOCKCHAIN) {
            this._status = STATUS.CONFIRMED

            this.addDomainEvent(new DepositConfirmedEvent(
                this._txHash.value,
                this._revpopAccount.value
            ))
        }
    }

    confirmByBlockchain(amount: Amount, hashLock: HashLock, timeLock: TimeLock) {
        if (this._status === STATUS.CREATED_BY_USER) {
            this._status = STATUS.CONFIRMED
            this._value = amount
            this._hashLock = hashLock
            this._timeLock = timeLock

            this.addDomainEvent(new DepositConfirmedEvent(
                this._txHash.value,
                (this._revpopAccount as RevpopAccount).value
            ))

            return right(Result.ok<void>())
        }
    }

    createInRevpopBlockchain(revpopContractId: string): Either<CreateInRevpopBlockchainUnexpectedError, Result<void>> {
        if (this._status === STATUS.CONFIRMED) {
            this._status = STATUS.CREATED_IN_REVPOP
            this._revpopContractId = revpopContractId

            return right(Result.ok<void>())
        }

        return left(new CreateInRevpopBlockchainUnexpectedError(`Deposit in tx ${this._txHash.value} can't be created in blockchain.`));
    }

    redeem(): Either<RedeemUnexpectedError, Result<void>>  {
        if (this._status === STATUS.CREATED_IN_REVPOP) {
            this._status = STATUS.REDEEMED

            this.addDomainEvent(new DepositRedeemedEvent(this._txHash.value))

            return right(Result.ok<void>())
        }

        return left(new RedeemUnexpectedError(`Deposit in tx ${this._txHash.value} can't be redeemed.`));
    }

    static createByUser(
        txHash: TxHash,
        revpopAccount: RevpopAccount,
        hashLock: HashLock,
    ): Deposit {
        return new Deposit(txHash, STATUS.CREATED_BY_USER, null, hashLock, null, revpopAccount)
    }

    static createByBlockchain(
        txHash: TxHash,
        amount: Amount,
        hashLock: HashLock,
        timeLock: TimeLock
    ): Deposit {
        return new Deposit(txHash, STATUS.CREATED_BY_BLOCKCHAIN, amount, hashLock, timeLock,null)
    }
}