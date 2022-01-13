import * as html from './testForm.hbs';
import * as css from './testForm.css';
import { ControlTemplate } from '../controlTemplate';

export class TestForm extends ControlTemplate{
    constructor() {
        super();
    }

    test( form, bomb ) {

        //CSS
        this._addStyle( 'testFormCss', css );

        //template
        var div = document.createElement('div');
        div.innerHTML = html;
        this.element = div.firstChild;
        document.body.appendChild( this.element );

        this._addEvents( );

        form.toHTML( 'testFormFormContainer', bomb );
    }

    _addEvents( ) {
        
        //escape key
        let f = (e) => {
            if( e.key === 'Escape' ) {
                document.removeEventListener("keydown", f);
                this._close();
            }
        };
        document.addEventListener("keydown", f);
    }

    _close() {
        document.body.removeChild( this.element );
    }
}