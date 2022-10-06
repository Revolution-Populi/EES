import dayjs from "dayjs";
import config from "../../config";
import BlockchainApiInterface from "../../Domain/BlockchainApiInterface";
//@ts-ignore
import {Manager} from "@revolutionpopuli/revpopjs-ws";
//@ts-ignore
import { FetchChain, TransactionBuilder, PrivateKey } from "@revolutionpopuli/revpopjs";

const PREIMAGE_HASH_CIPHER_SHA256 = 2

export default class Revpop implements BlockchainApiInterface {
    async createContract(accountToName: string, amount: number, hashLock: string, timeLock: number): Promise<string | null> {
        await this.connect()

        const accountFrom = await FetchChain("getAccount", config.revpop.account_from)
        const accountTo = await FetchChain("getAccount", accountToName)

        const privateKey = PrivateKey.fromWif(config.revpop.account_private_key as string);

        const asset = await FetchChain("getAsset", config.revpop.asset_symbol)

        if (asset === null) {
            return null
        }

        const amountWithPrecision = amount * Math.pow(10, asset.get('precision'))

        const txIssueAsset = new TransactionBuilder();
        txIssueAsset.add_type_operation("asset_issue", {
            fee: {
                amount: 0,
                asset_id: 0
            },
            issuer: accountFrom.get('id'),
            asset_to_issue: {
                amount: amountWithPrecision,
                asset_id: asset.get("id")
            },
            issue_to_account: accountFrom.get("id")
        });
        txIssueAsset.set_required_fees()
        txIssueAsset.add_signer(privateKey)

        try {
            await txIssueAsset.broadcast()
        } catch (e: any) {
            return null
        }

        const txHtlcCreate = new TransactionBuilder();
        txHtlcCreate.add_type_operation("htlc_create", {
            from: accountFrom.get('id'),
            to: accountTo.get('id'),
            fee: {
                amount: 0,
                asset_id: 0
            },
            amount: {
                amount: amountWithPrecision,
                asset_id: asset.get('id')
            },
            preimage_hash: [PREIMAGE_HASH_CIPHER_SHA256, hashLock],
            preimage_size: hashLock.length,
            // claim_period_seconds: 86400,
            claim_period_seconds: timeLock - dayjs().unix()
        });

        txHtlcCreate.set_required_fees()
        txHtlcCreate.add_signer(privateKey)

        try {
            await txHtlcCreate.broadcast()
        } catch (e: any) {
            return null
        }

        const accountFromUpdated = await FetchChain("getAccount", config.revpop.account_from)

        return accountFromUpdated.get("htlcs_from").last()
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
            });
        })
    }
}