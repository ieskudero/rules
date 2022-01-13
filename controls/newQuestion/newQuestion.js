import * as html from './newQuestion.hbs';
import * as css from './newQuestion.css';
import { ControlTemplate } from "../controlTemplate";
import { registerHelper, getTemplate } from 'digicon-web-templatemanager'; 
import { FormItem } from '../../src/formItem';
import { MonacoUtils } from '../../util/monacoUtils';

export class NewQuestion extends ControlTemplate{
    constructor( ) {
        super();

        this.monacoUtils = new MonacoUtils();

        registerHelper('eq', function(arg1, arg2, options) {
            return arg1 == arg2;
        });

        registerHelper('isSelected', function(arg1, arg2, options) {
            return arg1 == arg2 ? 'selected' : '';
        });

        registerHelper('isChecked', function(arg1, options) {
            return arg1 ? 'checked' : '';
        });

        registerHelper('inputText', function(arg1, options) {
            return arg1 !== '' ? arg1 : ' ... ';
        });

        registerHelper('valueLabel', function(arg1, options) {
            switch ( arg1 ) {
                case FormItem.TYPES.bool: return 'Valor:';
                case FormItem.TYPES.number: return 'Valor:';
                case FormItem.TYPES.text: return 'Valor:';
                case FormItem.TYPES.combo: return 'Valores:';
                case FormItem.TYPES.source: return 'Valor:';
            }
        }); 

        this._events = [];
    }

    getQuestion( question, callback ) {

        this.question = question;
        this.callback = callback;

        //remove events
        this._removeEvents( );

        //CSS
        this._addStyle( 'confiQuestionCss', css );

        //template
        var div = document.createElement('div');
        div.innerHTML = getTemplate(question, html);
        this.element = div.firstChild;
        document.body.appendChild( this.element );
        
        this._addEditor( question );

        //restore saved olf data
        this._restoreUIData();

        //add events
        this._addEvents( );
    }

    _addEditor( question ) {
        let editorContainer = document.querySelector( '.questionSource' );
        if( editorContainer === null ) return;

        if( this.monacoUtils.hasEditor( editorContainer ) ) {
            this.monacoUtils.setText( question.control_data.source );
        }
        else {
            this.monacoUtils.addEditor( editorContainer, question.control_data.source, ( text ) => {
                question.control_data.source = text;
            });
        }
    }

    _addEvents( ) {
        
        //on add click
        let add = document.querySelector('.questionSaveButton');
        add.onclick = (e) => this._OK( );
        this._events.push( { control: add, event: 'onclick' } );

        //on new data_control in combo click
        let btn = document.querySelector('#addControlDataBtn');
        if( btn ) {
            btn.onclick = (e) => this._addControlDataComboRow( );
            this._events.push( { control: btn, event: 'onclick' } );        
        }

        //on type changed
        let select = document.querySelector('#questionTypeSelect');
        select.onchange = (e) => this._onTypeChanged( e );
        this._events.push( { control: select, event: 'onchange' } ); 

        //on delete data_control in combo click
        let deletes = document.querySelectorAll('.deleteControlDataBtn');
        if( deletes ) {
            for (let i = 0; i < deletes.length; i++) {
                const delete_btn = deletes[i];
                delete_btn.onclick = 'click', (e) => this._deleteControlDataComboRow( e );
                this._events.push( { control: delete_btn, event: 'onclick' } );
            }
        }

        //on checkbox control_data checked
        let chk = document.querySelector( '.questionOptionValueCheck' );
        if( chk ) {
            chk.oninput = (e) => this._changeControlDataCheckBox( e );
            this._events.push( { control: chk, event: 'oninput' } );
        }
        
        //on input number/text control_data
        let inp = document.querySelector( '.questionControlDataInput' );
        if( inp ) {
            inp.oninput = (e) => this._changeControlDataNumberText( e );
            this._events.push( { control: inp, event: 'oninput' } );
        }

        //on delete data_control in combo click
        let comboinputs = document.querySelectorAll('.questionOptionValueInput');
        if( comboinputs ) {
            for (let i = 0; i < comboinputs.length; i++) {
                const combo_input = comboinputs[i];
                combo_input.oninput = (e) => this._changeControlDataComboRow( e );
                this._events.push( { control: combo_input, event: 'oninput' } );
            }
        }

        //on source template click
        let templateInput = document.querySelector('#questionSourceTemplate');
        if( templateInput ) {
            templateInput.oninput = (e) => this._changeControlDataSourceTemplate( e );
            this._events.push( { control: templateInput, event: 'oninput' } );
        }

        //on source css click
        let cssInput = document.querySelector('#questionSourceCss');
        if( cssInput ) {
            cssInput.oninput = (e) => this._changeControlDataSourceCss( e );
            this._events.push( { control: cssInput, event: 'oninput' } );
        }

        //escape key
        let f = (e) => {
            if( e.key === 'Escape' ) {
                document.removeEventListener("keydown", f);
                this._close();
            }
        };
        document.onkeydown = (e) => { if( e.key === 'Escape' ) { this._close(); } };
        this._events.push( { control: document, event: 'onkeydown' } );
    }

    _removeEvents() {
        this._events.forEach( ev => ev.control[ev.event] = null );
        this._events = [];

        let editorContainer = document.querySelector( '.questionSource' );
        this.monacoUtils.removeEditor( editorContainer );

    }

    _changeControlDataCheckBox( e ) {
        this.question.control_data = e.currentTarget.checked;
    }

    _changeControlDataNumberText( e ) {

        let value = e.currentTarget.value;
        if( this.question.type === FormItem.TYPES.number && value !== '' && !(isNaN( value ))) {
            value = parseFloat( value );
        }
        this.question.control_data = value;
    }

    _addControlDataComboRow( ) {
        
        this.question.control_data.push( { name: '', value: '' } );

        this._restartUI();
    }

    _deleteControlDataComboRow( e ) {

        let index = parseInt( e.currentTarget.dataset.index );

        this.question.control_data.splice( index, 1 );

        this._restartUI();
    }

    _changeControlDataComboRow( e) {

        let index = parseInt( e.currentTarget.dataset.index );
        let var_name = e.currentTarget.dataset.input;

        this.question.control_data[index][var_name] = e.currentTarget.value;
        
        this._restartUI();
    }

    _changeControlDataSourceTemplate( e ) {

        const input = e.currentTarget; 

        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            this.question.control_data.template = event.target.result;
            
            let parent = input.parentNode; 
            parent.innerText = this.question.control_data.template;            
        });
        reader.readAsText( input.files[0] );
    }
    
    _changeControlDataSourceCss( e ) {

        const input = e.currentTarget; 

        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            this.question.control_data.css = event.target.result;
            
            let parent = input.parentNode; 
            parent.innerText = this.question.control_data.css;            
        });
        reader.readAsText( input.files[0] );
    }

    _onTypeChanged( e ) {

        this._populateQuestion();

        this.question.type = e.currentTarget.value;
        switch( this.question.type ) {
            case FormItem.TYPES.number:{
                this.question.control_data = 0;
            }break;
            case FormItem.TYPES.text:{
                this.question.control_data = '';
            }break;
            case FormItem.TYPES.bool:{
                this.question.control_data = true;
            }break;
            case FormItem.TYPES.combo:{
                this.question.control_data = [ { name: '', value: '' } ];
            }break;
            case FormItem.TYPES.source:{
                this.question.control_data = { source: '', template: '', css: '' };
            }break;
        }

        this._restartUI();
    }

    _restartUI() {
        
        this._saveUIData();
        this.element.parentNode.removeChild( this.element );        
        this.getQuestion( this.question, this.callback  );        
    }

    _saveUIData() {
        //focused element
        this._uiData = {};
        if( document.activeElement instanceof HTMLInputElement ) {
            this._uiData.index = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.index : null;
            this._uiData.input = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.input : null; 
            this._uiData.cursor = null;
            if( this._uiData.index && this._uiData.input ) {       
                this._uiData.cursor = this._getCursorPos( document.activeElement );
            }
        }

        //save checkbox selected
        let checkboxes = this.element.querySelectorAll('.formBoolean');
        this._uiData.checkboxes = Array.from(checkboxes).map( c => { return { code: c.dataset.code, selected: c.selected }; } );
    }
    
    _restoreUIData(){

        if( !this._uiData ) return;

        //restore focused element
        if( this._uiData.index && this._uiData.input ) {
            let control = this.element.querySelector(`[data-index="${this._uiData.index}"][data-input="${this._uiData.input}"]`);
            if( control ) control.focus();
            if( this._uiData.cursor && typeof this._uiData.cursor.start !== 'undefined') this._setCursorPos( control, this._uiData.cursor.start, this._uiData.cursor.end );
        }

        //restore checkbox selected
        for (let i = 0; i < this._uiData.checkboxes.length; i++) {
            const checkbox = this._uiData.checkboxes[i];
            let control = this.element.querySelector(`[data-code="${checkbox.code}"]`);
            if( control ) control.selected = checkbox.selected;
        }
    }

    _OK( ) {

        //TODO: populate question
        this._populateQuestion();

        if( this.callback ) this.callback( this.question );

        this._close();       
    }

    _populateQuestion(){
        this.question.code = document.querySelector('#question_ID').value;
        this.question.question = document.querySelector('#question_Question').value;
        this.question.before = document.querySelector('#question_before').value;
        this.question.after = document.querySelector('#question_after').value;
        this.question.type = document.querySelector('#questionTypeSelect').value;
    }

    _close() {
        this._removeEvents();

        if( this.element.parentNode ) this.element.parentNode.removeChild( this.element );
    }
}