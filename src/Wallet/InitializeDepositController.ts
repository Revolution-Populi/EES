import {Controller, Get, HttpException} from '@nestjs/common';
import {InitializeDeposit, initializeDepositHandler} from "../../Context/Wallet";
import SuccessResponse from "../Response/SuccessResponse";
import config from "../../Context/Wallet/config";

@Controller('deposit')
export default class InitializeDepositController {
    @Get("initialize")
    async initialize(): Promise<SuccessResponse> {
        const command = new InitializeDeposit()
        const depositOrError = await initializeDepositHandler.execute(command)

        if (depositOrError.isLeft()) {
            throw new HttpException(depositOrError.value.error?.message as string, 500)
        }

        return Promise.resolve(SuccessResponse.create({
            session_id: depositOrError.value.getValue()?.sessionId.value,
            contract_address: config.eth.contract_address,
            receiver_address: config.contract.receiver,
            minimum_deposit: config.contract.minimum_deposit,
            minimum_timelock: config.contract.minimum_timelock
        }))
    }
}