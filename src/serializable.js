import { v4 as uuidv4 } from 'uuid';

export class Serializable {
    constructor(){
        this.type = 'Serializable';
        this.uuid = uuidv4();
    }

    clone() {
        let clone = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
        clone.uuid = uuidv4();

        return clone;
    }

    toJSON() {
        return {
            type: this.type,
            uuid: this.uuid
        }
    }

}