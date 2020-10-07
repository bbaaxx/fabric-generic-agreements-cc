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

import State from "./state";

async function getAllResults(promiseOfIterator) {
    const allResults = [];
    for await (const res of promiseOfIterator) {
        allResults.push(res.value.toString("utf8"));
    }
    return allResults;
}

/**
 * StateList provides a named virtual container for a set of ledger states.
 * Each state has a unique key which associates it with the container, rather
 * than the container containing a link to the state. This minimizes collisions
 * for parallel transactions on different states.
 */
export default class StateList {
    public name: string;
    private ctx: Context;
    private supportedClasses: {};

    constructor(ctx, listName) {
        this.ctx = ctx;
        this.name = listName;
        this.supportedClasses = {};
    }

    /**
     * Add a state to the list. Creates a new state in worldstate with
     * appropriate composite key.  Note that state defines its own key.
     * State object is serialized before writing.
     */
    async addState(state: State): Promise<void> {
        const key = this.ctx.stub.createCompositeKey(
            this.name,
            state.getSplitKey()
        );

        // TODO: Add error handling
        const result = await this.ctx.stub.putState(
            key,
            State.serialize(state)
        );
        return result;
    }

    async getState(key: string) {
        const ledgerKey = this.ctx.stub.createCompositeKey(
            this.name,
            State.splitKey(key)
        );

        // TODO: Add error handling
        const data = await this.ctx.stub.getState(ledgerKey);

        if (data && data.toString()) {
            const state = State.deserialize(data, this.supportedClasses);
            return state;
        } else {
            return null;
        }
    }

    /**
     * Get a state from the list using supplied start end keys.
     */
    async getByPartialKey(key) {
        const data = this.ctx.stub.getStateByPartialCompositeKey(
            this.name,
            State.splitKey(key)
        );

        const allResults = [];
        if (data) {
            for await (const res of data) {
                allResults.push(
                    State.deserialize(res.value, this.supportedClasses)
                );
            }
            return allResults;
        } else {
            throw new Error(
                `No data available for the specified query: ${key}`
            );
        }
    }

    /**
     * Update a state in the list. Puts the new state in world state with
     * appropriate composite key.  Note that state defines its own key.
     * A state is serialized before writing. Logic is very similar to
     * addState() but kept separate becuase it is semantically distinct.
     */
    async updateState(state) {
        const key = this.ctx.stub.createCompositeKey(
            this.name,
            state.getSplitKey()
        );
        const data = State.serialize(state);
        await this.ctx.stub.putState(key, data);
    }

    /** Stores the class for future deserialization */
    use(stateClass) {
        this.supportedClasses[stateClass.getClass()] = stateClass;
    }
}
