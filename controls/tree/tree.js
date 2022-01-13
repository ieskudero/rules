import * as html from './tree.hbs';
import * as subhtml from './subtree.hbs';
import * as css from './tree.css';
import { getTemplate, registerPartial } from 'digicon-web-templatemanager'; 
import { BaseClass } from 'digicon-events-base/classes/baseClass';

export class Tree extends BaseClass{
    cosntructor() {
        this.name = '';
    }

    init( containerId, data ) {

        this.data = data;
        this.name = data.name;

        this.container = document.querySelector( '#' + containerId );
        if( this.container === null ) return;

        //CSS
        let styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = css;
        document.head.appendChild(styleSheet);

        //register partial
        registerPartial( "tree", subhtml );

        //template
        let template = getTemplate( data, html );
        this.container.innerHTML = template;

        this._addEvents();
    }

    _addEvents() {

        //on element click
        let options = this.container.querySelectorAll('.conficonfiTree,.conficonfiTreeRoot');
        options.forEach(option => { 
            option.addEventListener( 'click',  (e) => this.trigger('click', e), false ); 
        });

        //on add Pointer
        let adds = this.container.querySelectorAll('.addTreeButton,.addTreeButtonRoot');
        adds.forEach(add => { 
            add.addEventListener( 'click',  (e) => this.trigger('addPointer', e), false ); 
        });
        
        //on delete Pointer
        let removes = this.container.querySelectorAll('.deleteTreeButton');
        removes.forEach(remove => { 
            remove.addEventListener( 'click',  (e) => this.trigger('deletePointer', e), false ); 
        });

        //on open/closeEvent
        this._addOpenCloseEvent();
    }

    _addOpenCloseEvent(){
        
        let arrows = this.container.querySelectorAll('.arrow');
        this._setInitialArrowvalues( arrows );
        arrows.forEach(arrow => { 
            arrow.removeEventListener( 'click', this._openCloseTree, false );
            arrow.addEventListener( 'click', this._openCloseTree, false ); 
        });
    }

    _setInitialArrowvalues( arrows ) {
        
        //options:
        //  no children : ''
        //  children&closed : 'arrow_right'
        //  children&open : 'arrow_drop_down'

        arrows.forEach( arrow => {
            let uuid = arrow.dataset.uuid;
            let item = this._getItem( this.data, uuid );
            item = item.pointer ? item.pointer : item;
            arrow.innerText = item.pointers && item.pointers.length > 0 ? 'arrow_drop_down' : '';
        } );
    }

    _openCloseTree( e ) {

        let isOpen = e.currentTarget.innerText === 'arrow_drop_down';
        
        e.currentTarget.innerText = isOpen ? 'arrow_right' : 'arrow_drop_down';

        let children = e.currentTarget.parentElement.parentElement.parentElement.children[1].children;        
        Array.from( children ).forEach( c => {
            c.style.display = isOpen ? 'none' : 'flex';            
        });
    }

    _getItem( item, uuid ) {
        if( typeof item === 'undefined' || item === null ) return null;
        if( item.uuid === uuid ) return item;
        
        if( item.pointers ) {
            for (let i = 0; i < item.pointers.length; i++) {
                const pointer = item.pointers[i];
                if( pointer.uuid === uuid ) return pointer;
                let it = this._getItem( pointer.pointer, uuid );
                if( it !== null ) return it;
            }
        }

        return null;

    }

}