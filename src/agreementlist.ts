/*******************************************************
 * Copyright (C) 2019-2020 Eduardo Mosqueda Chávez
 * <emosquedach@gmail.com>
 *
 * This file is part of the Agreements Chaincode Project.
 *
 * Agreements Chaincode Project can not be copied and/or
 * distributed without the express permission
 * of Eduardo Mosqueda Chávez
 *******************************************************/

import StateList from "./ledger-api/statelist";
import Agreement from "./agreement";

export default class AgreementList extends StateList {
    constructor(ctx) {
        super(ctx, "org.example.agreementlist");
        this.use(Agreement);
    }

    async addAgreement(agreement) {
        return this.addState(agreement);
    }

    async getAgreement(agreementKey): Promise<Agreement> {
        return this.getState(agreementKey);
    }

    async updateAgreement(agreement) {
        return this.updateState(agreement);
    }

    async getAllOwnerAgreements(partialKey) {
        return await this.getByPartialKey(partialKey);
    }
}
