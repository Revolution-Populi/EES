import BlockchainApiInterface from "../../Domain/BlockchainApiInterface";

interface CreateContract {
    accountToName: string,
    amount: number,
    hashLock: string,
    timeLock: number
}

export default class Stub implements BlockchainApiInterface {
    private createContractRequests: CreateContract[] = []
    private revpopContractId = '1.16.19'
    private shouldReturnError = false

    returnError() {
        this.shouldReturnError = true
    }

    async createContract(accountToName: string, amount: number, hashLock: string, timeLock: number): Promise<string | null> {
        this.createContractRequests.push({accountToName, amount, hashLock, timeLock})

        if (this.shouldReturnError) {
            return null
        }

        return this.revpopContractId
    }
}