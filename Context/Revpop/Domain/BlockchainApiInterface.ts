export default interface BlockchainApiInterface {
    createContract: (accountToName: string, amount: number, hashLock: string, timeLock: number) => Promise<string | null>
}
