import * as html from './accordeon.hbs';
import * as css from './accordeon.css';
import { getTemplate } from 'digicon-web-templatemanager'; 
import { BaseClass } from 'digicon-events-base/classes/baseClass';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { ControlTemplate } from '../controlTemplate';
import { ItemHtml } from '../itemHtml/itemHtml';

export class Accordeon extends ControlTemplate{
    constructor() {
        super();
        this.name = '';
        this.editors = [];
    }

    init( containerId, data, type) {

        this._clearEditors();

        this.data = data;

        this.container = document.querySelector( '#' + containerId );
        if( this.container === null ) return;

        //CSS
        this._addStyle( 'accordeonConfi', css );

        //template
        this._addHtml( this.container, data, html );

        switch( type ) {
            case 'BOMB':{ this._addBombEditor( type ); }; break;
            case 'FORMULA_BEFORE' : 
            case 'FORMULA_AFTER': { this._addFormulaEditor( type ); }; break;
        }

        this._addEvents();
    }

    _addBombEditor( type ) {
        let divs = this.container.querySelectorAll('.accordion');

        //before formula
        let div = this.container.querySelector('.before');
        let editor = this._addEditor( div, this.data.before );
        editor.onDidChangeModelContent( (e) => { this._onTextChanged( 0, type);} );
        this.editors.push( editor );
        
        //add bomb data
        divs[1].classList.add("active");
        let panel = divs[1].nextElementSibling;
        panel.dataset.hide = "false";
        divs[1].children[1].innerText = 'arrow_drop_up';
        div = this.container.querySelector( '.itemPanel' );
        new ItemHtml().init('itemPanel', this.data );

        //after formula
        div = this.container.querySelector('.after');
        editor = this._addEditor( div, this.data.after );
        editor.onDidChangeModelContent( (e) => { this._onTextChanged( 1, type);} );
        this.editors.push( editor );
    }

    _addFormulaEditor( type ) {
        
        let divs = this.container.querySelectorAll('.accordion');
        divs[0].innerText = 'Formula';
        divs[0].classList.add("active");
        let panel = divs[0].nextElementSibling;
        panel.dataset.hide = "false";

        for (let i = 1; i < divs.length; i++) {
            const div = divs[i];
            div.parentNode.removeChild( div );
        }

        let div = this.container.querySelector('.formulaText');
        
        let editor = this._addEditor( div, type === 'FORMULA_BEFORE' ? this.data.before : this.data.after );
        
        editor.onDidChangeModelContent( (e) => { this._onTextChanged( 0, type);} );

        this.editors.push( editor );    
    }

    _addEditor( div, text ) {

        if( text === null ) text = '';
        else if( text.startsWith( '=') ) text = text.substring( 1, text.length );

        let editor = monaco.editor.create(div, {
            value: text,
            language: 'javascript',
            minimap: { enabled: false },
            automaticLayout: true,
            contextmenu: false,
            fontSize: 12,
            scrollbar: {
               useShadows: false,
               vertical: "visible",
               horizontal: "visible",
               horizontalScrollbarSize: 12,
               verticalScrollbarSize: 12
            }
         });

        return editor;
    }

    _onTextChanged( index, type ){

        let editor = this.editors[index];
        let text = '=' + editor.getValue();

        switch( type ) {
            case 'BOMB':{
                if( index === 0) this.data.before = text;
                else this.data.after = text;
             }; break;
            case 'FORMULA_BEFORE' : { this.data.before = text }; break;
            case 'FORMULA_AFTER': { this.data.after = text  }; break;
        }
    }

    _addEvents() {
        let accordeons = document.getElementsByClassName("accordion");
        for (let i = 0; i < accordeons.length; i++) {
            let accordeon = accordeons[ i ];
            accordeon.addEventListener("click", (e) => {

                let selectedheader = e.currentTarget;
                if( selectedheader.innerText === 'Formula' ) return;

                selectedheader.classList.toggle("active");
                let panel = selectedheader.nextElementSibling;
                Array.from( accordeons ).forEach( a => {
                    
                    //hide panels
                    let p = a.nextElementSibling;
                    p.dataset.hide = p === panel ? "false" : "hide";

                    //change arrows
                    a.children[1].innerText = a === selectedheader ? 'arrow_drop_up' : 'arrow_drop_down';
                });
            });
          }
    }

    _clearEditors() {
        this.editors.forEach( e => e.getModel().dispose() );
        this.editors = [];
    }
}