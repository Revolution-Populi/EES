import {EntitySchemaColumnOptions} from "typeorm/entity-schema/EntitySchemaColumnOptions";
import TimeLock from "../../../Domain/TimeLock";

const TimeLockType: EntitySchemaColumnOptions = {
    type: Number,
    name: 'time_lock',
    nullable: true,
    transformer: {
        to(timeLock: TimeLock): number | null {
            return timeLock?.value || null
        },
        from(value: number | null): TimeLock | null {
            if (value === null) {
                return null
            }

            return TimeLock.create(value).getValue() as TimeLock
        }
    }
}

export default TimeLockType