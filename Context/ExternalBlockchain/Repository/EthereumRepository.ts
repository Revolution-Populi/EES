import Web3 from "web3";
import {AbiItem} from "web3-utils";
import {Contract as ContractWeb3} from "web3-eth-contract";
import dayjs from "dayjs";
import HashedTimelockAbi from "../../../src/assets/abi/HashedTimelock.json";
import RepositoryInterface from "./RepositoryInterface";
import Contract from "../Contract";
import config from "context/config";

export default class EthereumRepository implements RepositoryInterface {
    private _web3: Web3
    private _contract: ContractWeb3

    constructor() {
        this._web3 = new Web3(new Web3.providers.HttpProvider(
            `https://${config.eth?.network as string}.infura.io/v3/${config.eth?.providers.infura.api_key}`
        ))

        this._contract = new this._web3.eth.Contract(HashedTimelockAbi as AbiItem[], config.eth?.contract_address)
    }

    async txIncluded(txHash: string): Promise<boolean> {
        const tx = await this._web3.eth.getTransaction(txHash)

        return tx.blockNumber !== null;
    }

    async load(txHash: string, contractId: string): Promise<Contract | null> {
        const contractData = await this._contract.methods.getContract(contractId).call({
            from: config.eth.contract_address
        })

        const tx = await this.loadTx(txHash)
        const block = await this.loadBlock(tx.blockNumber as number)

        return new Contract(
            contractId,
            contractData.sender,
            contractData.receiver,
            contractData.amount,
            contractData.hashlock,
            contractData.timelock,
            contractData.withdrawn,
            contractData.refunded,
            contractData.preimage,
            dayjs.unix(block.timestamp as number)
        )
    }

    private async loadTx(txHash: string) {
        return await this._web3.eth.getTransaction(txHash)
    }

    private async loadBlock(blockNumber: number) {
        return await this._web3.eth.getBlock(blockNumber)
    }
}
