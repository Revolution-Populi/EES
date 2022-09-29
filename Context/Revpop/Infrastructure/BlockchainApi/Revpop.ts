import BlockchainApiInterface from "../../Domain/BlockchainApiInterface";
//@ts-ignore
import {Apis, ChainConfig, Manager} from "@revolutionpopuli/revpopjs-ws";
//@ts-ignore
import { FetchChain, TransactionBuilder, PrivateKey } from "@revolutionpopuli/revpopjs";
import config from "../../config";

export default class Revpop implements BlockchainApiInterface {
    async issueAsset(amount: string, account_to: string): Promise<void> {
        await this.connect()
        const accountFrom = await FetchChain("getAccount", config.revpop.account_from)
        const accountTo = await FetchChain("getAccount", account_to)

        const privateKey = PrivateKey.fromSeed(config.revpop.account_private_key as string);

        const tr = new TransactionBuilder();
        tr.add_type_operation("asset_issue", {
            fee: {
                amount: 0,
                asset_id: 0
            },
            issuer: accountFrom.get('id'),
            asset_to_issue: {
                amount: amount,
                asset_id: config.revpop.asset_id
            },
            issue_to_account: accountTo.get("id")
        });
        tr.add_signer(privateKey)
        const result = await tr.broadcast()
        console.log(result)

        return Promise.resolve(undefined)
    }

    createContract(accountFrom: string, accountTo: string, amount: string, hashLock: string, timeLock: number): Promise<void> {
        return Promise.resolve(undefined);
    }

    private async connect() {
        const connectionManager = new Manager({
            url: config.revpop.url,
            urls: [],
            optionalApis: {enableOrders: false},
        });

        return new Promise((resolve, reject) => {
            connectionManager.connect(true, config.revpop.url)
            .then(async () => {
                resolve(true)
            })
            .catch((e: any) => {
                reject()
                console.log(e)
            });
        })
    }
}