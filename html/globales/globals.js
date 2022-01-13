import * as html from './main.html';
import * as css from './main.css';
import { List } from '../../controls/list/list';
import { NameHtml } from '../../controls/nameHtml/nameHtml';
import { Rule } from '../../util/rule';
import { ControlTemplate } from '../../controls/controlTemplate';
import { AreYouSure } from '../../controls/areYouSure/areYouSure';
import { saveRule } from "../../util/dataSingleton";
import { Classes } from "../../src/classes";
import { MonacoUtils } from '../../util/monacoUtils';

export class Globals extends ControlTemplate{
    constructor( containerId, rules ) {
        super();
        let name = 'GLOBALES_CONFICONFI';
        this.selectedIndex = null;
        this.monacoUtils = new MonacoUtils();

        this.dbdata = rules.filter( r => (r.rule.name === name ) );
        this.container = document.querySelector('#' + containerId );

        if( this.dbdata.length === 0 ) {
            let rule = new Rule();
            rule.name = name;
            rule.rule = '[]';
            saveRule(rule.toJSON(), ( id ) => {
                this.dbdata = rules.filter( r => r.rule.name === name );
                this._addComponents();
            });
        }
        else this._addComponents();
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
    }

    _initControls() {
        
        //FORM LIST
        this.list = new List();
        this.list.subscribe( 'click', (e)=> this._ListGlobalSelected( e ) );
        this.list.subscribe( 'add', (e)=> this._AddGlobal( e ) );
        this.list.subscribe( 'remove', (e)=> this._RemoveGlobal( e ) );
        
        this.errorArea = this.container.querySelector( '#globalErrorArea' );
        this.errorArea.style.display = 'none';
    }

    _addEvents() {

        //save button
        let saveButton = this.container.querySelector('.globalsSaveButton');
        saveButton.addEventListener( 'click', async ( e ) => await this._saveGlobal() );
        
        //Ctrl+s key
        document.addEventListener( 'keydown', async ( e ) => await this._keySave(e) );
    }

    _fillList() {

        let globals = this.dbdata[0].item;
        for (let i = 0; i < globals.length; i++) {
            const global = globals[i];
            global.uuid = global.id = i;
        }

        let data = {
            id: 0,
            title: 'Globals',
            children: globals
        };

        this.list.init( 'globals', data );        
    }

    _ListGlobalSelected( e ) {

        //get selected global
        this.selectedIndex = parseInt( e.currentTarget.dataset.id );

        //TODO: show in formEditor
        this.showSelectedGlobal();
    }

    showSelectedGlobal() {

        let text = this.dbdata[0].item[this.selectedIndex].text;
    
        this._addEditor( text );
    }

    _AddGlobal( e ) {
        new NameHtml().getName( async ( name ) => {
            this.dbdata[0].item.push({ name: name, text: '' });

            await this._saveGlobal( ( ) => { this._clearUI(); } );
        } );
    }

    _RemoveGlobal( e ) {

        new AreYouSure().ask( async ( isSure ) => {  

            if( !isSure ) return;

            this.selectedIndex = parseInt( e.srcElement.dataset.id );
            this.dbdata[0].item.splice( this.selectedIndex, 1 );

            await this._saveGlobal( ( ) => { this._clearUI(); });
        });
    }

    _clearUI(){

        //set selected to null
        this.selectedIndex = null;

        //update list
        this._fillList();
    }

    async _keySave( e ) {
        if(e.ctrlKey && e.key === 's' ) await this._saveGlobal();
    }

    async _saveGlobal( callback ) {

        await this._checkGlobalParse(); 

        if( this.errorArea.style.display !== 'none' ) return; 

        let data = this.dbdata[0];
        data.rule.rule = JSON.stringify( data.item );
        saveRule( data.rule, ( id ) => {
            
            if( id > 0 ) 
                console.log('saved!');
            else
                console.error( 'ERROR SAVING!' );

            if( callback ) callback();
        } );
    }

    async _checkGlobalParse() {
        
        let cs = new Classes();
        let globals = this.dbdata[0].item;
        for (let i = 0; i < globals.length; i++) {
            const global = globals[i];
            try {
                await cs.loadClass( global.text );
            }
            catch ( error ) {
                let text = `wrong text format on global( ${i} ) ${global.name.toUpperCase()}:
                            ${error}`;
                this.errorArea.innerText += text;
            }
        }

        if( this.errorArea.innerText !== '' ) this.errorArea.style.display = 'block';
        else this._resetErrorArea();
    }

    _resetErrorArea() {
        this.errorArea.style.display = 'none';
        this.errorArea.innerText = '';
    }

    _addEditor( text ) {
        let editorContainer = this.container.querySelector('.globalText');
        if( !this.monacoUtils.hasEditor( editorContainer ) ) {
            this.monacoUtils.addEditor( editorContainer, text, ( text ) => {
    
                this.dbdata[0].item[this.selectedIndex].text = text;
    
                this._resetErrorArea();
            } );
        }
        else {
            this.monacoUtils.setText( editorContainer, text );
        }
    }

    _clearEditors() {
        this.monacoUtils.removeEditor( this.container.querySelector('.globalText') );
    }
}