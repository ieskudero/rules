import * as html from './main.html';
import * as css from './main.css';
import { List } from '../../controls/list/list';
import { Tree } from '../../controls/tree/tree';
import { Accordeon } from '../../controls/accordeon/accordeon';
import { Canvas3d } from './canvas3d';
import { assignRuleIdToBomb, saveRule, deleteRule } from '../../util/dataSingleton'; 
import { NameHtml } from '../../controls/nameHtml/nameHtml';
import { Rule } from '../../util/rule';
import { BombObject } from '../../src/bombObject';
import { BombSelection } from '../../controls/bombSelection/bombSelection';
import { Pointer } from '../../src/pointer';
import { AreYouSure } from '../../controls/areYouSure/areYouSure';

export class Items {
    constructor( containerId, rules ) {
        this.container = document.querySelector('#' + containerId );
        this.dbdata = rules.filter( r => r.item instanceof BombObject );
        this._addComponents();
        this.selectedItem = null;
    }

    _addComponents( ) {

        //HTML
        if( this.container === null) return;
        this.container.innerHTML = html;
        
        //CSS
        let styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = css;
        document.head.appendChild(styleSheet);

        this._initControls();

        this._addEvents();

        this._fillList();
        //this.initCanvas3d();
    }

    _initControls() {
        
        //BOMB LIST
        this.list = new List();
        this.list.subscribe( 'click', (e)=> this._ListBombSelected( e ) );
        this.list.subscribe( 'add', (e)=> this._AddBomb( e ) );
        this.list.subscribe( 'remove', (e)=> this._RemoveBomb( e ) );
        
        //BOMB TREE
        this.tree = new Tree();
        this.tree.subscribe( 'click', (e)=> this._TreeBombSelected( e ) );
        this.tree.subscribe( 'addPointer', (e)=> this._TreeAddPointer( e ) );
        this.tree.subscribe( 'deletePointer', (e)=> this._TreeDeletePointer( e ) );

        //BOMB ACCORDEON
        this.accordeon = new Accordeon();
    }

    _addEvents() {

        //save button
        let saveButton = document.querySelector('.itemsSaveButton');
        saveButton.addEventListener( 'click', ( e ) => this._saveItem() );

        //Ctrl+s key
        document.addEventListener( 'keydown', (e) => this._keySave(e) );
    }

    _fillList() {

        let data = {
            id: 0,
            title: 'Bombs',
            children: this.dbdata.map(r => r.item )
        };
        
        this.list.init( 'bombs', data );
        
    }

    _ListBombSelected( e ) {
        //get selected bomb
        let ruleId = parseInt( e.currentTarget.dataset.id );
        let item = this.dbdata.filter( b => b.rule.id === ruleId)[0];

        //set as selected
        this.selectedItem = item;

        //add selected bomb to tree
        this.tree.init( 'arbol', this.selectedItem.item );
    }

    _AddBomb( e ) {
        //create bomb and add to tree
        new NameHtml().getName( name => {
            let rule = new Rule();
            let newBomb = new BombObject();
            rule.name = name;
            newBomb.name = name;
            rule.rule = newBomb.toJSON();

            saveRule( rule.toJSON(), ( id ) => {
                rule.id = id;
                assignRuleIdToBomb( newBomb, id );
                this.selectedItem = { rule: rule, bomb: newBomb };
                this.dbdata.push( this.selectedItem );
                
                this._clearUI();

                //add selected bomb to tree
                this.tree.init( 'arbol', this.selectedItem.item );
            } );
        } );
    }

    _RemoveBomb( e ) {
        if( this.selectedItem === null ) return;

        
        new AreYouSure().ask( isSure => {  

            if( !isSure ) return;

            //remove rule from database
            let ruleId = this.selectedItem.rule.id;
            deleteRule( ruleId, ( deleteCount ) => {

                if( deleteCount > 0 ) {
                    for (let i = 0; i < this.dbdata.length; i++) {
                        if( this.dbdata[i].rule.id === ruleId ) {
                            this.dbdata.splice( i , 1 );
                            break;
                        }                    
                    }
                    this._clearUI();
                }

            });
        });
    }

    _clearUI(){

        //set selected to null
        this.selectedItem = null;

        //update list
        let data = {
            id: 0,
            name: 'bombObjects',
            children: this.dbdata.map(r => r.item )
        };
        this.list.init( 'bombs', data );

        //clear tree
        this._clearTree();

        //clear item div
        this._clearItemEditor();
    }

    _clearTree() {
        document.querySelector('#arbol').innerHTML='';
    }

    _clearItemEditor() {
        document.querySelector('#bomb').innerHTML='';
    }

    initCanvas3d() {
        this.canvas3d = new Canvas3d();
        this.canvas3d.init( 'container3d' );
    }

    _TreeBombSelected( e ) {
        
        e.cancelBubble = true;

        let type = e.srcElement.dataset.type;
        if(typeof type === 'undefined') return;

        let b = this.dbdata.filter(b => b.rule.id === parseInt( e.srcElement.dataset.id ) )[0];
        let item = this._getItem( b.item, e.srcElement.dataset.uuid );

        this.accordeon.init('bomb', item, type );
    }

    _TreeAddPointer( e ) {
        
        e.cancelBubble = true;

        let b = this.dbdata.filter(b => b.rule.id === parseInt( e.srcElement.dataset.id ) )[0];
        let parent = this._getItem( b.item, e.srcElement.dataset.uuid );

        if( parent instanceof Pointer ) parent = parent.pointer;

        //TODO: show bomb objects selection if any, otherwise create a new one
        new BombSelection().getBomb( this.dbdata.map( b => b.item ), ( uuid ) => {

            //get bomb clone
            let data = this.dbdata.filter(b => b.item.uuid === uuid )[0];
            let clone = data.item.clone();

            //get pointer
            let pointer = new Pointer();
            pointer.name = clone.name;
            pointer.pointer = clone;

            //add it to main bomb
            parent.pointers.push( pointer );
            assignRuleIdToBomb( parent, parent.id );

            this._resetTreeAndEditor( this.selectedItem.item, clone );
        });
    }

    _TreeDeletePointer( e ) {e.cancelBubble = true;

        let b = this.dbdata.filter(b => b.rule.id === parseInt( e.srcElement.dataset.id ) )[0];
        let item = this._getItem( b.item, e.srcElement.dataset.uuid );

        new AreYouSure().ask ( ( isSure ) => {

            if( !isSure ) return;

            //find parent and remove pointer from parent
            let bomb = this._getPointerParent( this.selectedItem.item, item.uuid );

            //remove
            let index = bomb.pointers.indexOf( item );
            bomb.pointers.splice( index, 1 );            

            this._resetTreeAndEditor( this.selectedItem.item, bomb );
        } );
    }

    _resetTreeAndEditor( treeItem, editorItem ) {
        this._clearTree();
        this._clearItemEditor();

        //add selected bomb to tree
        this.tree.init( 'arbol', treeItem );

        //add bomb to editor            
        this.accordeon.init('bomb', editorItem, 'BOMB' );
    }

    _keySave( e ) {
        if(e.ctrlKey && e.key === 's' ) this._saveItem();
    }

    _saveItem() {
        if( this.selectedItem === null ) return;

        this.selectedItem.rule.rule = this.selectedItem.item.toJSON();
        saveRule( this.selectedItem.rule, ( id ) => {
            
            if( id > 0 ) 
                console.log('saved!');
            else
                console.error( 'ERROR SAVING!' );
        } );
    }

    _getItem( item, uuid ) {
        
        if( item.uuid === uuid ) return item;
        else if ( item.type === 'Pointer' ) {
            return this._getItem( item.pointer, uuid );
        }
        else {
            if( item.pointers ) {
                for (let i = 0; i < item.pointers.length; i++) {
                    const p = item.pointers[i];
                    let b = this._getItem( p, uuid );
                    if( b ) return b;
                }
            }            
        }
    }

    _removeEqualSigns( data ){
        if( data.before.startsWith('=') ) data.before = data.before.substring( 1, data.before.length );
        if( data.after.startsWith('=') ) data.after = data.after.substring( 1, data.after.length );
    }

    _getPointerParent( bomb, pointerUuid ){
        for (let i = 0; i < bomb.pointers.length; i++) {
            const pointer = bomb.pointers[i];
            if( pointer.uuid === pointerUuid) return bomb;
            let child = this._getPointerParent( pointer.pointer, pointerUuid );
            if( child !== null ) return child;
        }

        return null;
    }
}