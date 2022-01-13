import * as html from './main.html';
import * as css from './main.css';
import { saveRule } from "../../util/dataSingleton";
import { Rule } from "../../util/rule";
import { ControlTemplate } from '../../controls/controlTemplate';
import dataTableTemplate from './constantsTable.hbs';
import * as cssTemplate from './constantsTable.css';
import { DatatableExcel } from '../../controls/QuestionDataTable/datatableExcel';
import { AreYouSure } from '../../controls/areYouSure/areYouSure';

export class Constants extends ControlTemplate{
    constructor( containerId, rules ) {
        super();
        let name = 'CONSTANTES_CONFICONFI';
        this._savingDelayTime = 750;
        this.dbdata = rules.filter( r => r.rule.name === name );
        this.container = document.querySelector('#' + containerId );
        
        if( this.dbdata.length === 0 ) {
            let rule = new Rule();
            rule.name = name;
            rule.rule = '[]';
            saveRule(rule, ( id ) => {
                this.dbdata = rules.filter( r => r.rule.name === name );
                this._initialize();
            });
        }
        else this._initialize();
    }

    _initialize() {

        this._addComponents();
        this._addConstants();
    }

    _addComponents() {
        //CSS
        this._addStyle( 'ConstantsCSS', css );
        this._addStyle( 'ConstantsDataTableCSS', cssTemplate );
    
        //HTML
        if( this.container === null) return;
        this.container.innerHTML = html;
    }

    _addConstants() {
        let dataTableData= {
            "headers": ["ID", "Valor", "Delete"],
            "data": []
        };

        let constants = this.dbdata[0].item;

        for (let i = 0; i < constants.length; i++) {
            const constant = constants[i];
            let row = { };
            
            row.ID = DatatableExcel.createInputCell(constant.key, true);
            row.Valor = DatatableExcel.createInputCell(constant.value, true);
            row.Editar = DatatableExcel.createButtonCell("delete", true);
            
            dataTableData.data.push( row );
        }

        let columnCount = dataTableData.headers.length;
        let props = {
            template: dataTableTemplate,
            container: 'constantsContainer',
            pagination: 5,
            sort: [0],
            search: DatatableExcel.range( 0, columnCount - 1 ),
            hidden: [ ]
        };

        let dt = new DatatableExcel(props, dataTableData);
        dt.subscribe('onAction', (data, e) => { this._onEditConstant( data, e ); });
        
        //add event for add row
        document.getElementById('addRowBtn').addEventListener( 'click', ( e )=> this._addNewRow( e ) );
    }

    _saveUIData() {
        //focused element
        this._uiData = {};
        if( document.activeElement instanceof HTMLInputElement ) {
            this._uiData.row = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.row : null;
            this._uiData.column = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.column : null; 
            this._uiData.cursor = null;
            this._uiData.cursor = this._getCursorPos( document.activeElement );
        }
    }

    _restoreUIData(){

        //restore focused element
        let control = this.container.querySelector(`input[data-row="${this._uiData.row}"][data-column="${this._uiData.column}"]`);
        if( control )  {
            control.focus();
            if( this._uiData.cursor && typeof this._uiData.cursor.start !== 'undefined') 
                this._setCursorPos( control, this._uiData.cursor.start, this._uiData.cursor.end );
        }
    }
    
    _onEditConstant( data, e ){
        let row = parseInt( data.row );

        if( data.delete ) {
            new AreYouSure().ask( isSure => {
                if( !isSure ) return;
                
                this.dbdata[0].item.splice([row],1);
                this._saveUIData();

                this._delayedSave(()=>{
                    this._addConstants();

                    this._restoreUIData();
                });
            });
        } else {

            let property = parseInt( data.column ) === 0 ? 'key' : 'value';
            
            //TODO: add delay before saving
            this.dbdata[0].item[row][property] = data.value;
            this._saveUIData();

            this._delayedSave(()=>{
                this._addConstants();

                this._restoreUIData();
            });
        }        
    }

    _addNewRow( e ){
        this.dbdata[0].item.push( { key:'', value: '' } );

        this._saveConstants(()=>{
            this._addConstants();
        });
    }

    _saveConstants( callback ) {
        let r = this.dbdata[0].rule;
        r.rule = JSON.stringify( this.dbdata[0].item );
        saveRule( r, ( id ) => { 
            console.log( 'saved!' ); 
            if( callback ) callback();
         } );
    }

    _delayedSave( callback ) {
        
        this.delay = new Date();

        if( this._saving ) return;
        this._saving = true;

        let f =  () => {
            if( new Date() - this.delay > this._savingDelayTime ) {
                this._saveConstants( () => {
                    delete this._saving;                    
                    if( callback ) callback();
                 } );
            } else {
                this._addTimeOut( f );
            }
        };
        this._addTimeOut( f );
    }

    _addTimeOut( callback ) {
        setTimeout( callback, this._savingDelayTime );
    }
}