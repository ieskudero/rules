import { GeometryItem } from './geometryItem';

export class BombObject extends GeometryItem {

    constructor() {
        super();
        this.type = 'BombObject';
        
        this.name = '';
        //array to store pointers to classes (perfil_izquierdo, perfil_derecho ...)
        this.pointers = [];
        //array to store basic attributes( number atts, string atts and bool atts )
        this.attributes = [];

        //array to store formItems
        this.forms = [];
    }

    explode() {
        

        //INSTEAD OF A NORMAL EXPLOSION WE CREATE A JSON, ADD POINTERS AND ATTRIBUTES AS PROPERTIES, AND EXPLODE THAT JSON

        let exploded = this.toJSON();
        
        //we remove the forms. Assume that they have been called already
        delete exploded.forms;
        
        //add pointers as properties
        let keys = [];
        for (let j = 0; j < this.pointers.length; j++) {
            const pointer = this.pointers[j];
            exploded[pointer.name] = pointer.pointer.toJSON();
            keys.push( {
                name: pointer.name,
                before: pointer.before,
                after: pointer.after
            } );
        }
        delete exploded.pointers;

        //add attributes as properties
        for (let j = 0; j < this.attributes.length; j++) {
            const attribute = this.attributes[j];
            exploded[attribute.name] = attribute.value;
        }
        delete exploded.attributes;

        //add parent-children relationships
        this._addParents( exploded );

        //launch before formula
        this._explodeString( exploded.before, exploded );

        //explode all properties that are formulas 
        //that aren't before, after, children or pointers
        exploded = this._explodeObject( exploded, exploded );

        //explode all pointers in order
        for (let j = 0; j < keys.length; j++) {
            let name = keys[ j ].name;

            let obj = exploded[ name ];

            //launch before formula
            this._explodeString( keys[ j ].before , obj );

            exploded[ name ] = this._explodeObject( obj, obj );

            //launch after formula
            this._explodeString( keys[ j ].after , obj );
        }

        //then explode children
        if( exploded.children ) {
            for (let i = 0; i < exploded.children.length; i++) {
                exploded.children[i] = exploded.children[i].explode();                
            }
        }
        
        //launch after formula
        this._explodeString( exploded.after, exploded );

        return exploded;
    }

    _addParents( bomb ) {
        if( typeof bomb !== 'object' || bomb === null ) return;
        
        let keys = Object.keys( bomb );

        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];

            if( key === 'parent' ) continue;

            const it = bomb[key];

            if( it === null ) continue;


            if( typeof it === 'object' ) {

                if( it instanceof Array ) {
                    for (let j = 0; j < it.length; j++) this._addParents( it[j] );
                }
                else if (it.type && (
                    it.type === 'Serializable' || 
                    it.type === 'Item' || 
                    it.type === 'GeometryItem' || 
                    it.type === 'Pointer' || 
                    it.type === 'BombObject' )
                ){
                    this._addParents( it );

                    if( !( it.parent ) ) { 
                        it.parent = bomb; 
                    }     
                }           
            }            
        }
    }

    _getJSONKeys( obj ) {
        let keys = Object.keys( obj );

        //remove before, after and children
        let i = keys.indexOf( 'before' ); if( i !== -1 ) keys.splice( i, 1 );
        i = keys.indexOf( 'after' ); if( i !== -1 ) keys.splice( i, 1 );
        i = keys.indexOf( 'children' ); if( i !== -1 ) keys.splice( i, 1 );
        i = keys.indexOf( 'parent' ); if( i !== -1 ) keys.splice( i, 1 );
        
        //remove pointers so we can later explode them in order
        if( this.pointers ) {
            for (let j = 0; j < this.pointers.length; j++) {
                const pointer = this.pointers[j];
                i = keys.indexOf( pointer.name );
                if( i !== -1 ) keys.splice( i, 1 ); 
            }
        }

        return keys;
    }

    clone() {
        let clone = super.clone();
        
        clone.name = this.name;
        clone.pointers = this.pointers.map( p => p.clone() );
        clone.attributes = this.attributes.map( a => { return { name: a.name, value: a.value }; } );

        return clone;
    }

    toJSON() {
        let json = super.toJSON();

        json.name = this.name;
        json.pointers = this.pointers.map( p => p.toJSON() );
        json.attributes = this.attributes.map( a => { return { name: a.name, value: a.value }; } );
        json.forms = this.forms.map( f => f.toJSON() );

        //copy also all the properties added to this class
        let added_keys = Object.keys( json );
        let new_keys = Object.keys( this );
        for (let i = 0; i < new_keys.length; i++) {
            const key = new_keys[i];
            if( !added_keys.includes( key ) ) json[key] = this[ key ];            
        }

        return json;
    }

}