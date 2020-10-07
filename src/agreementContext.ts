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

import { Context } from "fabric-contract-api";

import AgreementList from "./agreementlist.js";

export class AgreementContext extends Context {
    agreementList: AgreementList;
    constructor() {
        super();
        this.agreementList = new AgreementList(this);
    }
}
