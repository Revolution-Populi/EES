import ConfirmDepositByUser from './Application/Command/ConfirmDepositByUser/ConfirmDepositByUser'
import ConfirmDepositByUserHandler from './Application/Command/ConfirmDepositByUser/ConfirmDepositByUserHandler'
import ConfirmDepositByBlockchain from './Application/Command/ConfirmDepositByBlockchain/ConfirmDepositByBlockchain'
import ConfirmDepositByBlockchainHandler from './Application/Command/ConfirmDepositByBlockchain/ConfirmDepositByBlockchainHandler'
import CreateContractInRevpop from './Application/Command/CreateContractInRevpop/CreateContractInRevpop'
import CreateContractInRevpopHandler from './Application/Command/CreateContractInRevpop/CreateContractInRevpopHandler'
import RedeemDeposit from './Application/Command/RedeemDeposit/RedeemDeposit'
import RedeemDepositHandler from './Application/Command/RedeemDeposit/RedeemDepositHandler'
import TypeOrmRepository from "./Infrastructure/TypeOrmRepository";
import DataSource from "./Infrastructure/TypeORM/DataSource/DataSource";
import RevpopBlockchainApi from "./Infrastructure/BlockchainApi/Revpop";
import Converter from "./Infrastructure/Converter";

const repository = new TypeOrmRepository(DataSource)
const converter = new Converter()
const blockchainApi = new RevpopBlockchainApi()

const confirmDepositByUserHandler = new ConfirmDepositByUserHandler(repository)
const confirmDepositByBlockchainHandler = new ConfirmDepositByBlockchainHandler(repository)
const createContractInRevpopHandler = new CreateContractInRevpopHandler(repository, converter, blockchainApi)
const redeemDepositHandler = new RedeemDepositHandler(repository)

export {ConfirmDepositByUser, confirmDepositByUserHandler}
export {ConfirmDepositByBlockchain, confirmDepositByBlockchainHandler}
export {CreateContractInRevpop, createContractInRevpopHandler}
export {RedeemDeposit, redeemDepositHandler}
