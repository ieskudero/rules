import * as html from './areYouSure.hbs';
import * as css from './areYouSure.css';
import { ControlTemplate } from '../controlTemplate';

export class AreYouSure extends ControlTemplate{
    constructor() {
        super();
    }

    ask( callback ) {

        //CSS
        this._addStyle( 'confiAreYouSureCss', css );

        //template
        var div = document.createElement('div');
        div.innerHTML = html;
        this.element = div.firstChild;
        document.body.appendChild( this.element );

        this._addEvents( callback );
    }

    _addEvents( callback ) {
        
        //on ok click
        let add = document.querySelector('.areYouSureOKButton');
        add.addEventListener( 'click',  (e) => this._close( callback, true ), false );
        
        //on cancel click
        let remove = document.querySelector('.areYouSureCancelButton');
        remove.addEventListener( 'click',  (e) => this._close( callback, false ), false );

        //escape key
        let f = (e) => {
            if( e.key === 'Escape' ) {
                document.removeEventListener("keydown", f);
                this._close( callback, false )
            }
        };
        document.addEventListener("keydown", f);
    }

    _close( callback, response ) {
        document.body.removeChild( this.element );
        if( callback ) callback( response );
    }
}