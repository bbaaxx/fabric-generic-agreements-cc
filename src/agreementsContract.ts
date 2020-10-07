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

import { Contract } from "fabric-contract-api";
import Agreement from "./agreement.js";
import { AgreementActor } from "./agreementTypes";
import { AgreementContext } from "./agreementContext";
import { DispersionConditions } from "./conditionsTypes.js";

const initTest = {
    agreementType: "init",
    issuer: "admin",
    agreementUid: "000",
};

export class AgreementContract extends Contract {
    constructor() {
        super("agreements");
    }

    createContext() {
        return new AgreementContext();
    }

    async initLedger(ctx: AgreementContext) {
        const { agreementType, issuer, agreementUid } = initTest;
        try {
            const result = await this.create(
                ctx,
                agreementType,
                issuer,
                agreementUid,
                [],
                { distribution: [] }
            );
            return result;
        } catch (error) {
            throw new Error(`Chaincode initialization failed ${error}`);
        }
    }

    async testInit(ctx: AgreementContext) {
        const { agreementType, issuer, agreementUid } = initTest;
        try {
            return await ctx.agreementList.getAgreement(
                `${agreementType}:${issuer}:${agreementUid}`
            );
        } catch (error) {
            throw new Error(`Contract test fail`);
        }
    }

    async create(
        ctx: AgreementContext,
        agreementType,
        issuer,
        agreementUid,
        humanReadable?,
        machineReadable?
    ) {
        // create an instance of the agreement
        const agreement = Agreement.createInstance({
            agreementType,
            issuer,
            agreementUid,
            rules: {
                machineReadable: machineReadable,
                humanReadable: humanReadable,
            },
        });

        agreement.setOwner(issuer); // owner is issuer on creation
        agreement.setIssued();

        // Add the agreement to the list of all similar agreements in the ledger world state
        const txResult = await ctx.agreementList.addAgreement(agreement);
        console.log(txResult);

        return agreement;
    }

    /**
     * Get a single contract from the list
     * @param ctx AgreementContext
     * @param agreementKey string
     */
    async getOne(ctx: AgreementContext, agreementKey: string) {
        try {
            return await ctx.agreementList.getAgreement(agreementKey);
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Get all agreements of type and from owner, due to the
     * way Fabric works, it requires the agreementType parameter
     * to query the world state as we support several agreement types
     * @param ctx AgreementContext
     * @param agreementType string
     * @param owner string
     */
    async getAllFromOwner(
        ctx: AgreementContext,
        agreementType: string,
        owner: string
    ) {
        try {
            return await ctx.agreementList.getAllOwnerAgreements(
                `${agreementType}:${owner}`
            );
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Registers an actor to the agreement
     * @param ctx AgreementContext
     * @param agreementKey string
     * @param actor AgreementActor
     */
    async registerActor(
        ctx: AgreementContext,
        agreementKey: string,
        actor: string
    ) {
        let parsedActor: AgreementActor;
        try {
            parsedActor = JSON.parse(actor);
        } catch (error) {
            throw new Error("Invalid request format");
        }
        const agreement: Agreement = await ctx.agreementList.getAgreement(
            agreementKey
        );

        agreement.addActor(parsedActor);
        const txResult = await ctx.agreementList.updateAgreement(agreement);
        console.log(txResult);
        return agreement;
    }

    /**
     * Create a stamp in an agreement
     * @param ctx AgreementContext
     * @param agreementKey string
     * @param actor AgreementActor
     */
    async stampAgreement(
        ctx: AgreementContext,
        agreementKey: string,
        actor: string
    ) {
        const agreement = await ctx.agreementList.getAgreement(agreementKey);
        let parsedActor: AgreementActor;
        try {
            parsedActor = JSON.parse(actor);
        } catch (error) {
            throw new Error("Invalid request format");
        }
        agreement.stampAgreement(parsedActor);
        const txResult = await ctx.agreementList.updateAgreement(agreement);
        console.log(txResult);
        return agreement;
    }

    async updateRules(
        ctx: AgreementContext,
        agreementKey: string,
        newRules: string
    ) {
        const agreement = await ctx.agreementList.getAgreement(agreementKey);
        let parsedRules: Array<DispersionConditions>;
        try {
            parsedRules = JSON.parse(newRules);
        } catch (error) {
            throw new Error("Invalid request format");
        }
        agreement.setRules(parsedRules);
        const txResult = await ctx.agreementList.updateAgreement(agreement);
        console.log(txResult);
        return agreement;
    }

    async updateMachineRules(
        ctx: AgreementContext,
        agreementKey: string,
        mrConditions: string
    ) {
        const agreement = await ctx.agreementList.getAgreement(agreementKey);
        let parsedMrConditions: DispersionConditions;
        try {
            parsedMrConditions = JSON.parse(mrConditions);
        } catch (error) {
            throw new Error("Invalid request format");
        }
        agreement.setMrConditions(parsedMrConditions);
        const txResult = await ctx.agreementList.updateAgreement(agreement);
        console.log(txResult);
        return agreement;
    }

    /**
     * Triggers agreement activation
     * @param ctx AgreementContext
     * @param agreementKey string
     */
    async activateAgreement(ctx: AgreementContext, agreementKey: string) {
        const agreement = await ctx.agreementList.getAgreement(agreementKey);
        if (agreement.isCompleted()) {
            agreement.setActive();
        } else {
            throw new Error("Contract is not complete");
        }
        const txResult = await ctx.agreementList.updateAgreement(agreement);
        console.log(txResult);
        return agreement;
    }
}
