import {EntitySchemaColumnOptions} from "typeorm/entity-schema/EntitySchemaColumnOptions";
import Amount from "../../../Domain/Amount";

const AmountType: EntitySchemaColumnOptions = {
    type: String,
    name: 'value',
    nullable: true,
    transformer: {
        to(amount: Amount): string | null {
            return amount?.value || null
        },
        from(value: string | null): Amount | null {
            if (value === null) {
                return null
            }

            return Amount.create(value).getValue() as Amount
        }
    }
}

export default AmountType