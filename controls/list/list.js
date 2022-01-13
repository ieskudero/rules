import * as html from './list.hbs';
import * as css from './list.css';
import { ControlTemplate } from '../controlTemplate';

export class List extends ControlTemplate{
    cosntructor() {
        this.title = '';
    }

    init( containerId, data ) {

        this.title = data.title;

        this.container = document.querySelector( '#' + containerId );
        if( this.container === null ) return;

        //CSS
        this._addStyle( 'confiList', css );

        //template
        this._addHtml( this.container, data, html );

        this._addEvents();
    }

    _addEvents() {

        //on element click
        let items = this.container.querySelectorAll( '.listItemContainer' );
        items.forEach(item => { 
            item.addEventListener( 'click',  (e) => this._select( e ), false ); 
        });

        //on new button pressed
        this.container.querySelector( '#add_' + this.title ).addEventListener( 'click',
            (e) => this.trigger('add', e), 
            false
        );

        //on remove button pressed
        let deletes = this.container.querySelectorAll( '.listDeleteButton' );
        deletes.forEach( d => d.addEventListener( 'click', (e) => this.trigger('remove', e), false ) );
    }

    _select( e ) {
        this._deselectAll();
        Array.from( e.currentTarget.children ).forEach(c => c.classList.add( 'lselected' ) );

        this.trigger('click', e);
    }

    _deselectAll() {
        let items = this.container.querySelectorAll( '.listItemContainer' );
        Array.from( items ).forEach( item => Array.from( item.children ).forEach(c => c.classList.remove('lselected') ) );
    }
}