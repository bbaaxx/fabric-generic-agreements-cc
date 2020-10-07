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

import State from "./ledger-api/state";

import { AgreementActor, AgreementStamp } from "./agreementTypes";
import { DispersionConditions, NDAConditions } from "./conditionsTypes";

export type NewAgreementProps = {
    agreementType: string;
    issuer: string;
    agreementUid: string;
    rules: {
        humanReadable?: string[];
        machineReadable?: DispersionConditions | NDAConditions;
    };
};

const agreementStates = {
    ACTIVE: "active",
    COMPLETED: "completed",
    ISSUED: "issued",
    REVOKED: "revoked",
};

const actorRoles = {
    OBSERVER: "observer",
    SIGNER: "signer",
};

/**
 * Agreement class extends State class
 * Class will be used by application and smart contract to define a paper
 */
export default class Agreement extends State {
    agreementType: string;
    rules: {
        humanReadable: Array<string>;
        machineReadable: DispersionConditions | NDAConditions;
    };

    owner: string;
    issuer: string;
    actors: Array<AgreementActor>;
    stamps: Array<AgreementStamp>;

    constructor(obj: NewAgreementProps) {
        super(Agreement.getClass(), [
            obj.agreementType,
            obj.issuer,
            obj.agreementUid,
        ]);
        this.actors = [];
        this.stamps = [];

        Object.assign(this, obj);
    }

    /**
     * Getters and setters
     */
    // issuer
    getIssuer(): string {
        return this.issuer;
    }
    setIssuer(newIssuer: string): void {
        this.issuer = newIssuer;
    }

    // owner
    getOwner(): string {
        return this.owner;
    }
    setOwner(newOwner: string): void {
        this.owner = newOwner;
    }

    // actors
    getActors(): Array<AgreementActor> {
        return [...this.actors];
    }
    addActor(newActor: AgreementActor) {
        this.actors = [...new Set([...this.actors, newActor])];
    }

    // conditions
    getHrConditions() {
        return this.rules.humanReadable;
    }
    setHrConditions(newHrConditions): void {
        this.rules.humanReadable = newHrConditions;
    }
    getMrConditions() {
        return this.rules.machineReadable;
    }
    setMrConditions(newMrConditions: DispersionConditions): void {
        this.rules.machineReadable = newMrConditions;
    }
    getRules() {
        return this.rules;
    }
    setRules(newRules): void {
        this.rules = newRules;
    }

    /**
     * Utility methods for agreement states
     */
    setIssued(): void {
        this.currentState = agreementStates.ISSUED;
    }
    setActive(): void {
        this.currentState = agreementStates.ACTIVE;
    }
    setCompleted(): void {
        this.currentState = agreementStates.COMPLETED;
    }
    setRevoked(): void {
        this.currentState = agreementStates.REVOKED;
    }
    isIssued(): boolean {
        return this.currentState === agreementStates.ISSUED;
    }
    isActive(): boolean {
        return this.currentState === agreementStates.ACTIVE;
    }
    isCompleted(): boolean {
        return this.currentState === agreementStates.COMPLETED;
    }
    isRevoked(): boolean {
        return this.currentState === agreementStates.REVOKED;
    }

    stampAgreement(actor: AgreementActor): void | Error {
        const registeredActor = [...this.actors].find(
            (x) => x.uid === actor.uid
        );
        if (typeof registeredActor === "undefined") {
            throw new Error(
                `Actor ${actor.uid} is not registered on this contract`
            );
        } else if (registeredActor.role !== actorRoles.SIGNER) {
            throw new Error(`Actor ${actor.uid} cannot perform this action`);
        }
        const newStamp: AgreementStamp = {
            actor,
            timestamp: new Date().toUTCString(),
        };
        this.stamps = [...this.stamps, newStamp];
        if (
            this.actors.filter((x) => x.role === actorRoles.SIGNER).length ===
            this.stamps.length
        ) {
            this.setCompleted();
        }
    }

    // Glue implementation below
    static fromBuffer(buffer): Agreement {
        return Agreement.deserialize(buffer);
    }

    toBuffer(): Buffer {
        return Buffer.from(JSON.stringify(this));
    }

    static deserialize(data): Agreement {
        return State.deserializeClass(data, Agreement);
    }

    // Factory
    static createInstance(props: NewAgreementProps): Agreement {
        return new Agreement(props);
    }

    static getClass(): string {
        return "org.example.agreement";
    }
}
