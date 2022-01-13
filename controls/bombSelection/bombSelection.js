import * as html from './bombSelection.hbs';
import * as css from './bombSelection.css';
import { ControlTemplate } from '../controlTemplate';

export class BombSelection extends ControlTemplate {
    constructor() {
        super();
    }

    getBomb( bombs, callback ) {

        //CSS
        this._addStyle( 'confiBombCss', css );

        //template
        var div = document.createElement('div');
        this._addHtml( div, { children: bombs }, html );
        this.element = div.firstChild;
        document.body.appendChild( this.element );

        this._addEvents( callback );
    }

    _addEvents( callback ) {
        
        //on add click
        let add = document.querySelector('.bombOKButton');
        add.addEventListener( 'click',  (e) => this._OK( callback ), false );

        //escape key
        let f = (e) => {
            if( e.key === 'Escape' ) {
                document.removeEventListener("keydown", f);
                this._close();
            }
        };
        document.addEventListener("keydown", f);
    }

    _OK( callback ) {
       let data = document.querySelector('.bombHtmlValue');
       let uuid = data.options[data.selectedIndex].dataset.uuid;
       if( callback ) callback( uuid );

       this._close();       
    }

    _close() {
        document.body.removeChild( this.element );
    }
}