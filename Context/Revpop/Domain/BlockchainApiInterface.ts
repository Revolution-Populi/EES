export default interface BlockchainApiInterface {
    issueAsset: (amount: string, accountTo: string) => Promise<void>
    createContract: (accountFrom: string, accountTo: string, amount: string, hashLock: string, timeLock: number) => Promise<void>
}
