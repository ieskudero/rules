import { Item } from "./item";

export class Pointer  extends Item{
    constructor(name, pointer) {
        super();
        this.type = 'Pointer';
        
        this.name = typeof name === 'undefined' ? '' : name;
        this.pointer = typeof pointer === 'undefined' ? null : pointer;
    }

    clone() {
        let clone = super.clone();

        clone.name = this.name;
        clone.pointer = this.pointer ? this.pointer.clone() : null;

        return clone;
    }

    toJSON() {
        let json = super.toJSON();

        json.name = this.name;
        json.pointer = this.pointer ? this.pointer.toJSON() : {};

        return json;
    }
}