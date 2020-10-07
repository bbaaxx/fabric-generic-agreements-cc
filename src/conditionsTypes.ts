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

export type DispersionConditions = {
    agreementAccount: string;
    agreementTitle?: string;
    agreementDescription?: string;
    agreementLogoPath?: string;
    minAmount?: string;
    minBalance?: string;
    exactAmount?: string;
    distribution: Array<{
        beneficiary: string;
        targetAccount: string;
        type: string;
        value: string;
    }>;
};

export type NDAConditions = {
    startDate: Date;
    endDate: Date;
    entity: string;
    employee: string;
};
