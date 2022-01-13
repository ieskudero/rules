import * as html from './form.hbs';
import * as css from './form.css';
import { registerHelper, registerPartial, getTemplate } from "digicon-web-templatemanager";
import { Item } from './item';

export class FormItem extends Item{
    
    constructor(){
        super();

        //TODO: chapuza->deberían estar fuera y poder exportarlos, pero webpack da error
        this.TYPES = { 
            number: 'number',
            text: 'text',
            bool: 'bool',
            combo: 'combo',
            source: 'source'
        };

        this.type = 'FormItem';
        this.name = '';
        this.questions = [];

        /* executed events */
        /*
            beforeLoad ->   HTML load before. Launched before loading HTML
            afterLoad ->    HTML load after. Launched after loading HTML
            before ->       global before event. Launched before every action
            before ->       question before. Included in each question, launched after global before and before own action
            after ->        question after. Included in each question, launched after own action
            after ->        global after event. Launched after every action
        */

        this.beforeLoad = '';
        this.afterLoad = '';

        registerHelper('eq', function(arg1, arg2, options) {
            return arg1 == arg2;
        });
        registerHelper('or', function(arg1, arg2, options) {
            return arg1 || arg2;
        });
        registerHelper('convertBoolToChecked', function(arg1, options) {
            return arg1 ? 'checked' : '';
        });
        registerHelper('convertBoolToEnabled', function(arg1, options) {
            return arg1 ? '' : 'disabled';
        });
    }

    //@override
    explode() { return null; }

    toHTML( containerId, item ) {
        this.container = document.getElementById( containerId );

        if( this.container === null ) return;

        //get variables from questions and attach them as properties
        this._convertQuestions();
        
        //attach item in order to use it in the formulas
        this.item = item;

        //generate HTML
        this._generateHTML();
    }

    _generateHTML() {

        //execute onLoad formula
        this._explodeString( this.beforeLoad, this );

        //save old data: selectedIndex, focused element ...
        this._saveUIData();

        //create html & css
        this._addStyle( this.uuid.replaceAll('-','') );
        this._addHtml( this.container, this, html );

        //restore saved olf data
        this._restoreUIData();

        //add events
        this._addEvents();

        //TODO: capture with mutationobserver when the div is loaded and execute onAfterLoaded
        this._explodeString( this.afterLoad, this );

        this._fixCombos();

    }

    _saveUIData() {

        //focused element
        this._uiData = {};
        this._uiData.focusedCode = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.code : null;
        if( document.activeElement instanceof HTMLTextAreaElement ) {
            this._uiData.cursor = null;
            if( this._uiData.focusedCode ) this._uiData.cursor = this._getCursorPos( document.activeElement );
        }

        //save selected combo options
        let combos = this.container.querySelectorAll('.formCombo');
        this._uiData.combos = Array.from(combos).map( c => { return { code: c.dataset.code, sindex: c.selectedIndex }; } );

        //save checkbox selected
        let checkboxes = this.container.querySelectorAll('.formBoolean');
        this._uiData.checkboxes = Array.from(checkboxes).map( c => { return { code: c.dataset.code, selected: c.selected }; } );
    }

    _restoreUIData(){

        //restore focused element
        if( this._uiData.focusedCode ) {
            let control = this.container.querySelector(`[data-code="${this._uiData.focusedCode}"]`);
            if( control ) control.focus();
            if( this._uiData.cursor && typeof this._uiData.cursor.start !== 'undefined') this._setCursorPos( control, this._uiData.cursor.start, this._uiData.cursor.end );
        }

        //restore selected combo options
        for (let i = 0; i < this._uiData.combos.length; i++) {
            const combo = this._uiData.combos[i];
            let control = this.container.querySelector(`[data-code="${combo.code}"]`);
            if( control ) control.selectedIndex = combo.sindex;
        }

        //restore checkbox selected
        for (let i = 0; i < this._uiData.checkboxes.length; i++) {
            const checkbox = this._uiData.checkboxes[i];
            let control = this.container.querySelector(`[data-code="${checkbox.code}"]`);
            if( control ) control.selected = checkbox.selected;
        }
    }

    _fixCombos() {
        //If combos selected value has been changed in formula the HTML doesn't get noticed, hence the need to change it manually
        let combos = this._vars.filter(v => v.type === this.TYPES.combo);
        if( combos.length > 0 )
        {
            for (let i = 0; i < combos.length; i++) {
                const variable = combos[i];
                if( variable.control_data ) {
                    let cd = variable.control_data.filter( d => d.name === variable.value );
                    if( cd.length > 0) {
                        let control = this.container.querySelector(`[data-code="${variable.code}"]`);
                        control.selectedIndex = variable.control_data.indexOf( cd[0] );
                    }
                }
            }
        }
    }

    _convertQuestions() {
        this._vars = [];
        for (let i = 0; i < this.questions.length; i++) {
            const question = this.questions[i];
            
            let value = question.type === this.TYPES.bool ? false :
                        question.type === this.TYPES.combo ? question.control_data[0].value : ''
            //create the variable
            let variable = {
                selected: question.selected,
                enabled: typeof question.enabled === 'undefined' || question.enabled ? true : question.enabled,
                mandatory: question.mandatory,
                visible: question.visible,
                question: question.question,
                code: question.code,
                type: question.type,
                value: value,
                control_data: question.control_data,
                before: question.before,
                after: question.after
            };

            //add to list
            this._vars.push( variable );

            this[question.code] = variable;
        }
    }

    _addStyle( id ) {

        //remove other same style
        let old = document.head.querySelector("#a" + id);
        if( old ) old.parentNode.removeChild( old );

        //add new
        let styleSheet = document.createElement("style");
        styleSheet.id = id;
        styleSheet.type = "text/css";
        styleSheet.innerText = css;

        document.head.appendChild(styleSheet);
    }

    _addHtml( container, item, html, subhtml ) {
        
        //register partial
        if( subhtml ) registerPartial( "form", subhtml );

        //template
        if( item ) {
            let template = getTemplate(item, html);
            container.innerHTML = template;
        }
    }

    _addEvents() {

        let texts = this.container.querySelectorAll('.formText');
        let checkboxes = this.container.querySelectorAll('.formBoolean');
        let combos = this.container.querySelectorAll('.formCombo');

        for (let i = 0; i < texts.length; i++) {
            const control = texts[i];
            control.addEventListener('input', ( e ) => this._onTextChanged( e ) );
            control.addEventListener('propertychange', ( e ) => this._onTextChanged( e ) );
        }
        for (let i = 0; i < checkboxes.length; i++) {
            const control = checkboxes[i];
            control.addEventListener('click', ( e ) => this._onCheckBoxChanged( e ) );
        }
        for (let i = 0; i < combos.length; i++) {
            const control = combos[i];
            control.addEventListener('change', ( e ) => this._onComboChanged( e ) );
        }
    }

    _onTextChanged( e ) {

        //get code
        let code = e.target.dataset.code;
        let type = e.target.dataset.type;
        //get value
        let value = e.target.value;
        if( type == 'number' && value !== '' && !isNaN( value) ) value = parseFloat( value );

        //assign value
        this._assignValue( code, value );

    }

    _onCheckBoxChanged( e ) {
        
        //get code
        let code = e.target.dataset.code;

        //get value
        let value = e.target.checked;

        //assign value
        this._assignValue( code, value );

    }
    
    _onComboChanged( e ) {

        //get code
        let code = e.target.dataset.code;

        //get value
        let value = e.target.value;

        //assign value
        this._assignValue( code, value );

    }

    _assignValue( code, value ) {

        //launch before formula
        this._explodeString( this.before, this );

        let variable = this._vars.filter( v => v.code === code )[0];

        //launch controls before formula
        if( variable.before ) this._explodeString( variable.before, this );

        //add value to item
        this[code].value = value;
        if( this.item ) this.item[code] = value;

        //launch controls after formula
        if( variable.after ) this._explodeString( variable.after, this );

        //launch after formula
        this._explodeString( this.after, this );
    }

    _getCursorPos(input) {
        if ("selectionStart" in input && document.activeElement == input) {
            return {
                start: input.selectionStart,
                end: input.selectionEnd
            };
        }
        else if (input.createTextRange) {
            var sel = document.selection.createRange();
            if (sel.parentElement() === input) {
                var rng = input.createTextRange();
                rng.moveToBookmark(sel.getBookmark());
                for (var len = 0;
                         rng.compareEndPoints("EndToStart", rng) > 0;
                         rng.moveEnd("character", -1)) {
                    len++;
                }
                rng.setEndPoint("StartToStart", input.createTextRange());
                for (var pos = { start: 0, end: len };
                         rng.compareEndPoints("EndToStart", rng) > 0;
                         rng.moveEnd("character", -1)) {
                    pos.start++;
                    pos.end++;
                }
                return pos;
            }
        }
        return -1;
    }

    _setCursorPos(input, start, end) {
        if( start === null || end === null ) return;

        if (arguments.length < 3) end = start;
        if ("selectionStart" in input) {
            setTimeout(function() {
                input.selectionStart = start;
                input.selectionEnd = end;
            }, 1);
        }
        else if (input.createTextRange) {
            var rng = input.createTextRange();
            rng.moveStart("character", start);
            rng.collapse();
            rng.moveEnd("character", end - start);
            rng.select();
        }
    }

    toJSON() {
        let json = super.toJSON();
        
        json.name = this.name;
        json.beforeLoad = this.beforeLoad;
        json.afterLoad = this.afterLoad;

        json.questions = this.questions.map( q => {
            let cd = q.control_data;
            if( typeof cd === 'undefined' ) cd = null;
            if( Array.isArray( cd ) ) cd.map( v => { return { name: v.name, value: v.value } } );

            return {
                question: q.question,
                mandatory: q.mandatory,
                visible: q.visible,
                code: q.code,
                type: q.type,
                control_data: cd,
                before: q.before,
                after: q.after
            };
        });

        return json;
    }
}

FormItem.TYPES = { 
    number: 'number',
    text: 'text',
    bool: 'bool',
    combo: 'combo',
    source: 'source'
};