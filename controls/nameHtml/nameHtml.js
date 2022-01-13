import * as html from './nameHtml.hbs';
import * as css from './nameHtml.css';
import { ControlTemplate } from '../controlTemplate';

export class NameHtml extends ControlTemplate{
    constructor() {
        super();
    }

    getName( callback ) {

        //CSS
        this._addStyle( 'confiNameCss', css );

        //template
        var div = document.createElement('div');
        div.innerHTML = html;
        this.element = div.firstChild;
        document.body.appendChild( this.element );

        this._addEvents( callback );
    }

    _addEvents( callback ) {
        
        //on add click
        let add = document.querySelector('.nameOKButton');
        add.addEventListener( 'click',  (e) => this._OK( callback ), false );

        //escape key
        let f = (e) => {
            if( e.key === 'Escape' ) {
                document.removeEventListener("keydown", f);
                this._close();
            } else if( e.key === 'Enter' ) {
                document.removeEventListener("keydown", f);
                this._OK( callback );
            }
        };
        document.addEventListener("keydown", f);
    }

    _OK( callback ) {
       let data = document.querySelector('.nameHtmlValue');

       if( data.value !== '' && callback ) callback( data.value );

       this._close();       
    }

    _close() {
        document.body.removeChild( this.element );
    }
}