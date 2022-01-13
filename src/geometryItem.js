import { Item } from './item.js';

export class GeometryItem extends Item{
    constructor() {
        super();
        
        this.type = 'GeometryItem';
        this.anchor = 0;//number from 0-9, or formula
        this.margin = {
            left: 0,
            right: 0,
            up: 0,
            down: 0,
        };
        this.width = {
            max: 0,
            min: 0,
            current: 0
        };
        this.height = {
            max: 0,
            min: 0,
            current: 0
        };
        this.depth = {
            max: 0,
            min: 0,
            current: 0
        };
    }

    clone() {
        let clone = super.clone();
        
        clone.anchor = this.anchor;
        clone.margin = {
            left: this.margin.left,
            right: this.margin.right,
            up: this.margin.up,
            down: this.margin.down,
        };
        clone.width = {
            max: this.width.max,
            min: this.width.min,
            current: this.width.current
        };
        clone.height = {
            max: this.height.max,
            min: this.height.min,
            current: this.height.current
        };
        clone.depth = {
            max: this.depth.max,
            min: this.depth.min,
            current: this.depth.current
        };

        return clone;
    }

    toJSON() {
        let instance = super.toJSON();
        
        instance.anchor = this.anchor;
        instance.margin = {
            left: this.margin.left,
            right: this.margin.right,
            up: this.margin.up,
            down: this.margin.down,
        };
        instance.width = {
            max: this.width.max,
            min: this.width.min,
            current: this.width.current
        };
        instance.height = {
            max: this.height.max,
            min: this.height.min,
            current: this.height.current
        };
        instance.depth = {
            max: this.depth.max,
            min: this.depth.min,
            current: this.depth.current
        };

        return instance;
    }
}