import {EntitySchema} from "typeorm"
import DepositRequest from "../../../Domain/DepositRequest";
import RevpopAccountType from "../Type/RevpopAccountType";
import HashLockType from "../Type/HashLockType";
import UniqueEntityIDType from "../Type/UniqueEntityIDType";

const DepositEntity = new EntitySchema<DepositRequest>({
    name: "DepositRequest",
    tableName: 'deposit_request',
    target: DepositRequest,
    columns: {
        id: UniqueEntityIDType,
        // @ts-ignore
        _revpopAccount: RevpopAccountType,
        _hashLock: HashLockType,
        _status: {
            type: Number,
            name: 'status',
        },
        _createdAt: {
            name: 'created_at',
            createDate: true,
        },
    },
})

export default DepositEntity
