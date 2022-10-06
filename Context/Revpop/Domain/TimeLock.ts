import ValueObject from "../../Core/Domain/ValueObject";
import {Result} from "../../Core";
import dayjs from "dayjs";

interface Props {
    value: number;
}

export default class TimeLock extends ValueObject<Props> {
    private constructor(props: Props) {
        super(props);
    }

    get value(): number {
        return this.props.value
    }

    public static create(timeLock: number): Result<TimeLock> {
        const now = dayjs().unix()

        if (now > timeLock) {
            return Result.fail<TimeLock>('TimeLock must be in the future')
        }

        return Result.ok<TimeLock>(new TimeLock({value: timeLock}))
    }
}