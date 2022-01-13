import { Items } from "./items/items";
import { loadRules } from '../util/dataSingleton'; 
import { Forms } from "./forms/forms";
import { Constants } from "./constantes/constants";
import { Globals } from "./globales/globals";


export class TabManager {
    constructor() {
    }

    async init() {
        let rules = await loadRules();
        
        this.structures = new Items('tabContent_1', rules );
        this.forms = new Forms('tabContent_2', rules );
        this.globals = new Globals('tabContent_3', rules );
        this.constants = new Constants('tabContent_4', rules );
    }

    addInteraction( buttonClassName, tabClassName ) {
        this.tabs = document.getElementsByClassName( tabClassName );
        this.buttons = document.getElementsByClassName( buttonClassName );
        
        // add onClick eventListener
        for (let i = 0; i < this.tabs.length; i++) {
            this.buttons[i].addEventListener( 'click', ( evt ) => { this._onButtonClick( evt ); }, false );            
        }

        //show first tab and hide the rest
        for (let i = 0; i < this.tabs.length; i++) this._hideTab( this.tabs[i], this.buttons[i] );
        this._showTab( this.tabs[0], this.buttons[0] );
    }

    _onButtonClick( evt ) {
        // remove the class "active" in all
        for (let i = 0; i < this.tabs.length; i++) this._hideTab( this.tabs[i], this.buttons[i] );

        // Show the current tab, and add an "active" class to the button that opened the tab
        let active = document.getElementById( 'tabContent_' + evt.currentTarget.id );
        this._showTab( active, evt.srcElement );
    }

    _hideTab( tab, button ) {
        tab.style.display = "none";
        button.className = button.className.replace(" active", "");
    }

    _showTab( tab, button ) {
        tab.style.display = "grid";
        button.className += " active";
    }

}