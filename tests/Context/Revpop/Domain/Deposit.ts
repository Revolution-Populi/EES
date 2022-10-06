import {expect} from 'chai';
import dayjs from "dayjs";
import Deposit from '../../../../Context/Revpop/Domain/Deposit';
import TxHash from '../../../../Context/Revpop/Domain/TxHash';
import RevpopAccount from '../../../../Context/Revpop/Domain/RevpopAccount';
import HashLock from "../../../../Context/Revpop/Domain/HashLock";
import TimeLock from "../../../../Context/Revpop/Domain/TimeLock";
import Amount from "../../../../Context/Revpop/Domain/Amount";

describe('Revpop::Deposit', () => {
    const txHash = TxHash.create('0x2592cf699903e83bfd664aa4e339388fd044fe31643a85037be803a5d162729f').getValue() as TxHash
    const hashLock = HashLock.create('0x14383da019a0dafdf459d62c6f9c1aaa9e4d0f16554b5c493e85eb4a3dfac55c').getValue() as HashLock

    it('should create new deposit by user', () => {
        const revpopAccount = RevpopAccount.create('revpop_account').getValue() as RevpopAccount

        const deposit = Deposit.createByUser(txHash, revpopAccount, hashLock)

        expect(deposit.txHash.equals(txHash)).true
        expect(deposit.revpopAccount).not.null
        expect((deposit.revpopAccount as RevpopAccount).equals(revpopAccount)).true
        expect(deposit.hashLock).equals(hashLock)
        expect(deposit.timeLock).null
    });

    it('should create new deposit by blockchain', () => {
        const timeLock = TimeLock.create(dayjs().add(1, 'month').unix()).getValue() as TimeLock
        const amount = Amount.create('100000000000000000').getValue() as Amount

        const deposit = Deposit.createByBlockchain(txHash, amount, hashLock, timeLock)

        expect(deposit.txHash.equals(txHash)).true
        expect(deposit.revpopAccount).null
        expect(deposit.value).equals(amount)
        expect(deposit.hashLock).equals(hashLock)
        expect(deposit.timeLock).equals(timeLock)
    });
});
