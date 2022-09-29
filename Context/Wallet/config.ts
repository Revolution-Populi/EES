import Config from "../Core/config";

const config = {
    ...Config.config(),
    db: {
        name: process.env.WALLET_DATABASE,
        host: process.env.WALLET_DATABASE_HOST,
        port: parseInt(process.env.ETH_DATABASE_PORT as string, 10),
        user: process.env.WALLET_DATABASE_USER,
        password: process.env.WALLET_DATABASE_PASSWORD
    },
    eth: {
        contract_address: process.env.ETH_CONTRACT_ADDRESS as string,
    },
    contract: {
        receiver: process.env.ETH_RECEIVER as string,
        minimum_deposit: parseFloat(process.env.MINIMUM_DEPOSIT_AMOUNT as string),
        minimum_timelock: parseInt(process.env.MINUMUM_TIMELOCK as string, 10)
    },
}

export default config