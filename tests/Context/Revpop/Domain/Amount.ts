import {expect} from 'chai';
import Amount from "../../../../Context/Revpop/Domain/Amount";

describe('Revpop::Amount', () => {
    describe('success', () => {
        it('should create new Amount', () => {
            const amountOrError = Amount.create('100000000000000000') // 0.1 ETH

            expect(amountOrError.isSuccess).true
            expect(amountOrError.getValue()?.value).equals('100000000000000000')
        })
    })

    describe('error', () => {
        describe('should return error if amount is invalid', () => {
            const cases: {
                amount: string
            }[] = [
                { amount: 'qwe' },
                { amount: '-100' },
            ]

            cases.forEach(({amount}) => {
                it(`When called with ${amount} should return error`, function() {
                    const amountOrError = Amount.create(amount)

                    expect(amountOrError.isSuccess).false
                })
            })
        });
    })
});
