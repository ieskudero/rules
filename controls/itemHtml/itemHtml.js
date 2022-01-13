import * as html from './itemHtml.hbs';
import * as css from './itemHtml.css';
import * as subhtml from './attributeHtml.hbs';
import { ControlTemplate } from '../controlTemplate';
import { NameHtml } from '../nameHtml/nameHtml';

export class ItemHtml extends ControlTemplate{
    cosntructor() {

    }

    init( containerId, item ) {

        this.item = item;
        this.containerId = containerId;

        this.container = document.querySelector( '#' + containerId );
        if( this.container === null ) {
            this.container = document.querySelector( '.' + containerId );
            if( this.container === null) return;
        }

        //CSS
        this._addStyle( 'confiItemHtml', css );

        //template
        this._addHtml( this.container, item, html, subhtml );

        this._addEvents();
    }

    _addEvents() {

        //on add click
        let add = this.container.querySelector('.itemAddButton');
        add.addEventListener( 'click',  (e) => this._addAttribute(), false );    

        //on remove click
        let removes = this.container.querySelectorAll( '.itemRemoveButton');
        removes.forEach( r => r.addEventListener( 'click', (e) => this._removeAttribute( e ), false ) );

        //on change         
        let changes = this.container.querySelectorAll( '.itemValue');
        changes.forEach( r => {
            r.addEventListener('input', ( e ) => this._onChange( e ) );
            r.addEventListener('propertychange', ( e ) => this._onChange( e ) );
        } );

    }

    _addAttribute() {
        //launch ui to ask for name. Then add new attribute and launch init again
        new NameHtml().getName( ( name ) => {
            this.item.attributes.push( {
                name: name,
                value: ''
            } );
            this.init( this.containerId, this.item );
        } );
    }

    _removeAttribute( e ) {
        //remove attribute and launch init again
    }

    _onChange( e ) {
        //find att by name and change value
        let attName = e.target.dataset.name;
        if( typeof attName === 'undefined' ) {
            this.item.name = e.target.value;
        }
        else {
            let att = this.item.attributes.filter( a => a.name === attName )[0];
            att.value = e.target.value;
        }
    }
}