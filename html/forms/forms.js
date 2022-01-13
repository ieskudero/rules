import * as html from './main.html';
import * as css from './main.css';
import * as htmlEditor from './formEditor.hbs';
import * as cssEditor from './formEditor.css';
import { DatatableExcel } from '../../controls/QuestionDataTable/datatableExcel.js';
import dataTableTemplate from '../../controls/QuestionDataTable/datatableExcel.hbs';
import { List } from '../../controls/list/list';
import { assignRuleIdToBomb, saveRule, deleteRule } from '../../util/dataSingleton'; 
import { NameHtml } from '../../controls/nameHtml/nameHtml';
import { Rule } from '../../util/rule';
import { FormItem } from '../../src/formItem';
import { ControlTemplate } from '../../controls/controlTemplate';
import { NewQuestion } from '../../controls/newQuestion/newQuestion';
import { TestForm } from '../../controls/testForm/testForm';
import { AreYouSure } from '../../controls/areYouSure/areYouSure';

export class Forms extends ControlTemplate{
    constructor( containerId, rules ) {
        super();
        this.selectedItem = null;

        this.dbdata = rules.filter( r => (r.item instanceof FormItem ) );
        this.container = document.querySelector('#' + containerId );
        this._addComponents();
    }

    _addComponents( ) {

        //HTML
        if( this.container === null) return;
        this.container.innerHTML = html;
        
        //CSS
        let styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = css;
        document.head.appendChild(styleSheet);

        this._initControls();

        this._addEvents();

        this._fillList();
    }

    _initControls() {
        
        //FORM LIST
        this.list = new List();
        this.list.subscribe( 'click', (e)=> this._ListFormSelected( e ) );
        this.list.subscribe( 'add', (e)=> this._AddForm( e ) );
        this.list.subscribe( 'remove', (e)=> this._RemoveForm( e ) );
        
    }

    _addEvents() {

        //save button
        let saveButton = document.querySelector('.formsSaveButton');
        saveButton.addEventListener( 'click', ( e ) => this._saveForm() );
        
        //test button
        let testButton = document.querySelector('.formsTestButton');
        testButton.addEventListener( 'click', async ( e ) => await this._testForm() );
        
        //export button
        let exportButton = document.querySelector('.formsExportButton');
        exportButton.addEventListener( 'click', ( e ) => this._exportForm() );

        //Ctrl+s key
        document.addEventListener( 'keydown', (e) => this._keySave(e) );
    }

    _fillList() {

        let data = {
            id: 0,
            title: 'Forms',
            children: this.dbdata.map(r => r.item )
        };

        this.list.init( 'forms', data );
        
    }

    _ListFormSelected( e ) {
        //get selected form
        let ruleId = parseInt( e.currentTarget.dataset.id );
        let item = this.dbdata.filter( b => b.rule.id === ruleId)[0];

        //set as selected
        this.selectedItem = item;
        
        //TODO: show in formEditor
        this.showSelectedForm();
    }

    showSelectedForm() {
        if( this.selectedItem === null ) return;

        //CSS
        this._addStyle( 'formEditorCSS', cssEditor );
    
        this._addHtml( document.querySelector('#formEditor'),
                       this.selectedItem.item, 
                       htmlEditor );

        this.container.querySelector( '#formName' ).addEventListener( 'input', e => {
            this.selectedItem.item.name = e.currentTarget.value;
            this.selectedItem.rule.name = e.currentTarget.value;
        });
        this.container.querySelector( '#formName' ).addEventListener( 'propertychange', e => {
            this.selectedItem.item.name = e.currentTarget.value;
            this.selectedItem.rule.name = e.currentTarget.value;
        });

        //insert datatables with the questions
        this._addQuestions();
    }

    _addQuestions() {
        let dataTableData= {
            "headers": ["ID", "Pregunta", "Opciones", "Obligatorio","Visible", "Editar"],
            "data": []
        };

        for (let i = 0; i < this.selectedItem.item.questions.length; i++) {
            const question = this.selectedItem.item.questions[i];
            let row = { };
            row.ID = DatatableExcel.createInputCell(question.code, true);
            row.Pregunta = DatatableExcel.createInputCell(question.question, true);

            let opt = {};
            switch( question.type ) {
                case FormItem.TYPES.number:
                case FormItem.TYPES.text: {
                    opt = DatatableExcel.createInputCell(question.control_data, true);
                } break;
                case FormItem.TYPES.bool: {
                    opt = DatatableExcel.createCheckboxCell(question.control_data, true);
                } break;
                case FormItem.TYPES.combo: {
                    let combo_options = [];
                    let selectedIndex = 0;
                    if( question.control_data && question.control_data.map ) {
                        //map to datatableexcel format
                        combo_options = question.control_data.map( cd => { return { v: cd.name, d: cd.value }; });
                        //set selected
                        let s = question.control_data.filter( cd => cd.selected === 'selected' );
                        if( s.length > 0 ) selectedIndex = question.control_data.indexOf( s[0] ); 
                    }
                    opt = DatatableExcel.createSelectCell(combo_options, selectedIndex, true);
                } break;
                case FormItem.TYPES.source: {
                    opt = DatatableExcel.createInputCell(question.control_data.source, false);
                }break;
            }
            row.Opciones = opt;
            row.Obligatorio = DatatableExcel.createCheckboxCell(question.mandatory, true);
            row.Visible = DatatableExcel.createCheckboxCell(question.visible, true);
            row.Editar = DatatableExcel.createButtonCell("edit", true);
            dataTableData.data.push( row );
        }

        let columnCount = dataTableData.headers.length;
        let props = {
            template: dataTableTemplate,
            container: 'formQuestionContainer',
            pagination: 5,
            sort: [0],
            search: DatatableExcel.range( 0, columnCount - 1 ),
            hidden: [ ]
        };

        let dt = new DatatableExcel(props, dataTableData);
        dt.subscribe('onAction', (data, e) => { this._onEditQuestion( data, e ); });
        
        //add event for add row
        document.getElementById('addRowBtn').addEventListener( 'click', ( e )=> this._addNewRow( e ) );
    }

    _addNewRow( e ) {
        let question = {
            code: '',
            question: '',
            type: FormItem.TYPES.text,
            control_data: '',
            visible: true,
            mandatory: false,
            enabled: true
        };

        new NewQuestion().getQuestion( question, ( q ) => {
            this.selectedItem.item.questions.push( q );
            
            this._addQuestions();
        } );
    }

    _onEditQuestion( data, e ){

        let code = data.code;
        let question = this.selectedItem.item.questions.filter(q => q.code === code )[0];
    
        if( e.currentTarget.innerText === 'edit' ) {
            new NewQuestion().getQuestion( question, ( q ) => { question = q; this._addQuestions();} );
        }
        else if( e.currentTarget.innerText === 'delete' ) {
            
            new AreYouSure().ask( isSure => {  

                if( !isSure ) return;

                let index = this.selectedItem.item.questions.indexOf( question );
                this.selectedItem.item.questions.splice( index, 1 );
                this._addQuestions();
            });
        }
        else {
            let index = parseInt( data.index );
            switch( index ) {
                case 0: {           //ID
                    question.code = data.value;
                }break;
                case 1: {           //QUESTION
                    question.question = data.value;
                }break;
                case 2: {           //OPTIONS
                    this._assignControlDataToQuestion( question, data.value, e );
                }break;
                case 3: {           //MANDATORY
                    question.mandatory = data.value === 'on';
                }break;
                case 4: {           //VISIBLE
                    question.visible = data.value === 'on';
                }break;
            }
        }
        
    }

    _assignControlDataToQuestion( question, value, e ) {
        switch( question.type ) {
            case FormItem.TYPES.number:{
                value = value !== '' && !(isNaN( value )) ? parseFloat( value ) : 0;
                question.control_data = value;
            } break;
            case FormItem.TYPES.bool:
            case FormItem.TYPES.text:{
                question.control_data = value;
            } break;
            case FormItem.TYPES.combo:{
                question.control_data.forEach(cd => {
                    if( cd.name === value ) cd.selected = 'selected';
                    else delete cd.selected;
                });
            } break;
            case FormItem.TYPES.source: {
                //is disabled
            }break;
        }
    }

    _AddForm( e ) {
        //create form and add to tree
        new NameHtml().getName( name => {
            let rule = new Rule();
            let newForm = new FormItem();
            rule.name = name;
            newForm.name = name;
            rule.rule = newForm.toJSON();

            saveRule( rule.toJSON(), ( id ) => {
                rule.id = id;
                assignRuleIdToBomb( newForm, id );
                this.selectedItem = { rule: rule, item: newForm };
                this.dbdata.push( this.selectedItem );
                
                this._clearUI();

                //TODO: add selectedForm to formEditor
            } );
        } );
    }

    _RemoveForm( e ) {
        
        if( this.selectedItem === null ) return;

        new AreYouSure().ask( isSure => {  

            if( !isSure ) return;

            //remove rule from database
            let ruleId = this.selectedItem.rule.id;
            deleteRule( ruleId, ( deleteCount ) => {

                if( deleteCount > 0 ) {
                    for (let i = 0; i < this.dbdata.length; i++) {
                        if( this.dbdata[i].rule.id === ruleId ) {
                            this.dbdata.splice( i , 1 );
                            break;
                        }                    
                    }
                    this._clearUI();
                }
            });

        });
    }

    _clearUI(){

        //set selected to null
        this.selectedItem = null;

        //update list
        let data = {
            id: 0,
            name: 'Form',
            children: this.dbdata.map(r => r.item )
        };
        this.list.init( 'forms', data );

        //TODO: clear editor
    }

    
    _keySave( e ) {
        if(e.ctrlKey && e.key === 's' ) this._saveForm();
    }

    _exportForm() {
        if( this.selectedItem === null ) return;

        navigator.clipboard.writeText( JSON.stringify( this.selectedItem.item.toJSON(), null, 2 ) );
      
        /* Alert the copied text */
        alert("FORM COPIED TO CLIPBOARD");
    }

    _saveForm() {
        if( this.selectedItem === null ) return;

        this.selectedItem.rule.rule = this.selectedItem.item.toJSON();
        saveRule( this.selectedItem.rule, ( id ) => {
            
            if( id > 0 ) 
                console.log('saved!');
            else
                console.error( 'ERROR SAVING!' );
        } );
    }

    async _testForm() {
        if( this.selectedItem === null ) return;
        let form = this.selectedItem.item;

        //TODO: ask for a BombObject to add into the form
        
        //create a div to launch it
        new TestForm().test( form, null );
    }
}