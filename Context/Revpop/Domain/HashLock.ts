import ValueObject from "../../Core/Domain/ValueObject";
import {Result} from "../../Core";

interface Props {
    value: string;
}

export default class HashLock extends ValueObject<Props> {
    private constructor(props: Props) {
        super(props);
    }

    get value(): string {
        return this.props.value
    }

    public static create(hashLock: string): Result<HashLock> {
        if (hashLock.length === 0) {
            return Result.fail<HashLock>('HashLock should be provided')
        }

        if (!/^0x([A-Fa-f0-9]{64})$/.test(hashLock)) {
            return Result.fail<HashLock>('HashLock is invalid')
        }

        return Result.ok<HashLock>(new HashLock({
            value: hashLock
        }))
    }
}