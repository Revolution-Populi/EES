import Web3 from "web3";
import BN from 'bn.js';
import ValueObject from "../../Core/Domain/ValueObject";
import {Result} from "../../Core";

interface Props {
    value: string;
}

export default class Amount extends ValueObject<Props> {
    private constructor(props: Props) {
        super(props);
    }

    get value(): string {
        return this.props.value
    }

    public static create(amount: string): Result<Amount> {
        let amountBI: BN

        try {
            amountBI = Web3.utils.toBN(amount)
        } catch (e: any) {
            return Result.fail<Amount>('Invalid amount value')
        }

        if (amountBI.lten(0)) {
            return Result.fail<Amount>('Amount should be more than 0')
        }

        return Result.ok<Amount>(new Amount({
            value: amount
        }))
    }
}