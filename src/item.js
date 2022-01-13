import Cst from './constantes';
import { Serializable } from './serializable';

//See if tree-shaking removes it. If removes it, use it somewhere just to store it
var Constantes = Cst;

export class Item extends Serializable {
    constructor() {
        super();
        
        this.type = 'Item';
        
        this.before = null;
        this.after = null;
        
        this.parent = null;
        this.children = [];
        this.reference = '';
    }

    clone() {
        let clone = super.clone();

        clone.before = this.before;
        clone.after = this.after;

        clone.reference = this.reference;
        
        for (let i = 0; i < this.children.length; i++) {
            let cc = this.children[i].clone();
            cc.parent = clone;
            clone.children.push( cc );
        }

        return clone;
    }

    explode() {
        return this._explodeItem( this );    
    }

    _explodeItem( item ) {
         //create clone
         let exploded = item.clone();

         //launch before formula
         item._explodeString( exploded.before, exploded );
 
         //explode all properties that are formulas
         exploded = item._explodeObject( exploded, exploded );
 
         //then explode children
         if( exploded.children ) {
             for (let i = 0; i < exploded.children.length; i++) {
                 exploded.children[i] = exploded.children[i].explode();                
             }
         }
         
         //launch after formula
         item._explodeString( exploded.after, exploded );
 
         return exploded;
    }

    _explodeValue( obj, context ) {
        let result = obj;
        // IS_FORMULA
        if( typeof obj === 'string' ) {
            result = this._explodeString( obj, context );           
        }
        else if ( obj instanceof Item ) {
            result = this._explodeItem( obj );
        }
        else if ( this._isObject( obj ) ) {
            result = this._explodeObject( obj, context );
        }

        return result;
    }

    _explodeObject( obj, context ) {

        let keys = this._getJSONKeys( obj );
        for (let i = 0; i < keys.length; i++) {
            const value = obj[ keys[ i ] ];

            let result = this._explodeValue( value, context );
            obj[ keys[ i ] ] = result;
        }

        return obj;
    }

    _explodeString( str, context ) {
        if( typeof str === undefined || str === null ) return str;
        if( str.startsWith( '=' ) ) {
            return this.parseFormula( str.substring(1,str.length ).trim(), context );            
        }
        return str;
    }

    parseFormula( formula, context ) {
        
        if(typeof formula === 'undefined' || formula === null || formula === '') return '';
        try {        
            if( formula.startsWith ('{') ) {
                //add all there is inside method and return that method
                let first = formula.lastIndexOf('{') + 1;
                let last = formula.lastIndexOf('}');
                let str = formula.substring(1, last);
                if(str.length === 0) return '';
                let value = new Function( str );
                return value.call( context );

            } else {
                let value = function() { return eval(formula); };
                return value.call( context );
            }
        } catch (error) {
            console.error( `FORMULA PARSE ERROR IN ${context.uuid} ITEM. ${error}` );
        }
    }

    _getJSONKeys( obj ) {
        let keys = Object.keys( obj );

        //remove before, after and children
        if( obj instanceof Item ) {
            let i = keys.indexOf( 'before' ); if( i !== -1 ) keys.splice( i, 1 );
            i = keys.indexOf( 'after' ); if( i !== -1 ) keys.splice( i, 1 );
            i = keys.indexOf( 'children' ); if( i !== -1 ) keys.splice( i, 1 );
        }
        return keys;
    }

    _isObject(obj)
    {
        return obj !== undefined && obj !== null && obj.constructor == Object;
    }

    toJSON() {
        let json = super.toJSON();
        
        json.before = this.before;
        json.after = this.after;
        json.children = this.children.map(c => c.toJSON() );
        json.reference = this.reference;

        return json;
    }
}