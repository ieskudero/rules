import { GeometryItem } from "./geometryItem";
import { Item } from "./item";
import { BombObject } from "./bombObject";
import { Pointer } from "./pointer";
import { FormItem } from "./formItem";

export class ItemParser {
    constructor() {

    }

    fromJSON( json ) {
        if ( json === null || typeof json === 'undefined' ) return null;

        switch( json.type ) {
            case 'Item': return this._fromItemJSON( new Item(), json );
            case 'GeometryItem': return this._fromGeometryItemJSON( new GeometryItem(), json );
            case 'BombObject': return this._fromBombJSON( new BombObject(), json );
            case 'FormItem': return this._fromFormItemJSON( new FormItem(), json );
            case 'Pointer': return this._fromPointerJSON( new Pointer(), json );
        }
        
        return null;
    }

    _fromItemJSON( instance, json ){
        
        instance.uuid = json.uuid;
        instance.before = json.before;
        instance.after = json.after;
        instance.reference = json.reference;
        instance.children.map( c => { let cc = this.fromJSON( c ); cc.parent = this; return cc; } );

        return instance;
    }

    _fromGeometryItemJSON( instance, json ) {

        this._fromItemJSON( instance, json );

        instance.anchor = json.anchor;
        instance.margin = json.margin;
        instance.width = json.width;
        instance.height = json.height;
        instance.depth = json.depth;

        return instance;
    }
    
    _fromFormItemJSON( instance, json ) {

        this._fromItemJSON( instance, json );

        instance.name = json.name;
        instance.beforeLoad = json.beforeLoad;
        instance.afterLoad = json.afterLoad;

        instance.questions = json.questions.map( q => {
            let cd = q.control_data;
            if( typeof cd === 'undefined' ) cd = null;
            if( Array.isArray( cd ) ) cd.map( v => { return { name: v.name, value: v.value } } );
            return {
                question: q.question,
                mandatory: q.mandatory,
                visible: q.visible,
                code: q.code,
                type: q.type,
                control_data: cd,
                before: q.before,
                after: q.after
            };
        });

        return instance;
    }

    _fromBombJSON( instance, json ) {

        this._fromGeometryItemJSON( instance, json );

        instance.name = json.name;
        if( json.pointers && json.pointers instanceof Array )
            instance.pointers = json.pointers.map( p => this._fromPointerJSON( new Pointer(), p ) );
        if( json.attributes )
            instance.attributes = json.attributes.map( a => { return { name: a.name, value: a.value }; } );

        if( json.forms )
            instance.forms = json.forms.map( f => this._fromFormItemJSON( new FormItem(), f ) );

        //copy also all the properties added to this class
        let added_keys = Object.keys( instance );
        let new_keys = Object.keys( json );
        for (let i = 0; i < new_keys.length; i++) {
            const key = new_keys[i];
            if( !added_keys.includes( key ) ) instance[key] = json[ key ];            
        }

        return instance;
    }

    _fromPointerJSON( instance, json ) {
        
        this._fromItemJSON( instance, json );
        
        instance.name = json.name;
        if( json.pointer ) instance.pointer = this.fromJSON( json.pointer );

        return instance;
    }

}