import Config from "../Core/config";

const config = {
    ...Config.config(),
    db: {
        name: process.env.REVPOP_DATABASE,
        host: process.env.REVPOP_DATABASE_HOST,
        port: parseInt(process.env.REVPOP_DATABASE_PORT as string, 10),
        user: process.env.REVPOP_DATABASE_USER,
        password: process.env.REVPOP_DATABASE_PASSWORD
    },
    revpop: {
        url: process.env.REVPOP_NODE_URL,
        account_from: process.env.REVPOP_ACCOUNT_FROM,
        asset_symbol: process.env.REVPOP_ASSET_SYMBOL,
        account_private_key: process.env.REVPOP_ACCOUNT_PRIVATE_KEY
    }
}

export default config