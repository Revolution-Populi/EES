import RepositoryInterface from "./RepositoryInterface";

export default class StubRepository implements RepositoryInterface {
    createContract(externalId: string, accountToName: string, amount: number, hashLock: string, timeLock: number) {
        return Promise.resolve(null);
    }

    public async disconnect() {
        return undefined
    }
}
