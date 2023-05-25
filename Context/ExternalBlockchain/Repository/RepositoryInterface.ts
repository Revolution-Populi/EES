import Contract from "../Contract";
import { BlockTransactionString, TransactionReceipt } from "web3-eth";
import { EventData } from "web3-eth-contract";
import { Map } from "immutable";

export default interface RepositoryInterface {
    txIncluded: (txHash: string) => Promise<boolean>;
    loadDepositContract: (txHash: string, contractId: string) => Promise<Contract | null>;
    loadWithdrawContract: (txHash: string, contractId: string) => Promise<Contract | null>;
    getLastBlockNumber: () => Promise<number>;
    getBlock: (number: number) => Promise<BlockTransactionString | null>;
    loadDepositHTLCNewEvents: (fromBlock: number, toBlock: number) => Promise<EventData[]>;
    loadWithdrawHTLCNewEvents: (fromBlock: number, toBlock: number) => Promise<EventData[]>;
    loadHTLCRedeemEvents: (fromBlock: number, toBlock: number) => Promise<EventData[]>;
    redeem: (contractId: string, secret: string, receiver: string) => Promise<string>;
    getTransactionReceipt: (txHash: string) => Promise<TransactionReceipt>;
    getAsset: () => Map<string, number>;
    getGasPrice: () => Promise<string>;
    createWithdrawHTLC: (receiver: string, hashlock: string, timelock: number, amount: string) => Promise<string>;
}
