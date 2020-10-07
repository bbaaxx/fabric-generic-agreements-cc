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

export default class State {
    baseClassName: any;
    key: string;
    currentState: any;

    constructor(stateClass, keyParts) {
        this.baseClassName = stateClass;
        this.key = State.makeKey(keyParts);
        this.currentState = null;
    }

    getClass() {
        return this.baseClassName;
    }

    getKey() {
        return this.key;
    }

    getSplitKey() {
        return State.splitKey(this.key);
    }

    getCurrentState() {
        return this.currentState;
    }

    serialize() {
        return State.serialize(this);
    }

    static serialize(object) {
        return Buffer.from(JSON.stringify(object));
    }

    static deserialize(data, supportedClasses) {
        // TODO: REFACTOR
        let json = JSON.parse(data.toString());
        let objClass = supportedClasses[json.baseClassName];
        if (!objClass) {
            throw new Error(`Unknown baseClassName of ${json.baseClassName}`);
        }
        let object = new objClass(json);
        return object;
    }

    static deserializeClass(data, objClass) {
        let json = JSON.parse(data.toString());
        let object = new objClass(json);
        return object;
    }

    static makeKey(keyParts) {
        return keyParts.join(":");
    }

    static splitKey(key) {
        return key.split(":");
    }
}
