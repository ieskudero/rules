// This singleton is used among the backend and metabackend
import { Data } from 'digicon-web-model/data/data';
import { ItemParser } from '../src/itemParser';
import { Bind, updateOriginalValue } from './binding';

let d = new Data();
//launch this using unsafe chrome:
//chrome.exe --user-data-dir="C://Chrome dev session" --disable-web-security
//to execute this command in windows: Windows + R
d.setDomain( 'https://projects.hei-tecnalia.com', '/ENEANEW/' );
export const data = d;

var rules = [];
export async function loadRules() {

    if( rules.length === 0 ) {

        //get rules from data and share among tabs
        let db = await d.getRulesAsync( { params: '[]', filter: '{}' } );
        if( db.ok ) {
            let parser = new ItemParser();
            rules = db.data.map(r => { 
                
                let json = JSON.parse( r.rule );
                let obj = parser.fromJSON( json );
                if( obj !== null ) assignRuleIdToBomb( obj, r.id );
                
                return { 
                    rule: r,
                    item: obj !== null ? Bind( obj ) : json
                };
            } );
        }
    }

    return rules;

};

export function saveRule( rule, callback ) {

    let oldId = rule.id;
    d.saveRule( rule, ( id ) => {
            
        if( id > 0 ) {

            rule.id = id;

            let json = typeof rule.rule === 'string' ? JSON.parse( rule.rule ) : rule.rule;
            
            let obj = new ItemParser().fromJSON( json );
            if( obj !== null ) assignRuleIdToBomb( obj, id );
            let r = { rule: rule, item: obj !== null ? Bind( obj ) : json };

            if( oldId < 0 ) {                
                rules.push( r );
            }
            else {
                let old = rules.filter( r => r.rule.id === oldId )[0];
                if( r.item.uuid ) {
                    r.item.uuid === old.item.uuid;
                    updateOriginalValue( r.item, 'name' );
                }
                rules.filter( r => r.rule.id === oldId )[0] = r;
            }

            console.log('saved!');
        }
        else {
            console.error( 'ERROR SAVING!' );
        }

        callback( id );
    } );

}

export function deleteRule( id, callback ) {
    d.deleteRule( id, ( deleteCount ) => {

        if( deleteCount > 0 ) {
            let index = rules.indexOf( r => r.rule.id === id );
            rules.splice( index, 1 );
        }

        callback( deleteCount );

    });
}


export function assignRuleIdToBomb( item, id ) {
    item.id = id;
    if( item.pointers ) {
        for (let i = 0; i < item.pointers.length; i++) {
            const pointer = item.pointers[i];
            pointer.id = id;
            assignRuleIdToBomb( pointer.pointer, id );            
        }
    }
}