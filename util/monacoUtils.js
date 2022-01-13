import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

var editors = new WeakMap();

export class MonacoUtils {
    constructor(){

    }

    addEditor( div, text, onTextChanged ) {

        this.removeEditor( div );

        let editor = monaco.editor.create(div, {
            value: text,
            language: 'javascript',
            minimap: { enabled: false },
            automaticLayout: true,
            contextmenu: false,
            fontSize: 12,
            scrollbar: {
            useShadows: false,
            vertical: "visible",
            horizontal: "visible",
            horizontalScrollbarSize: 12,
            verticalScrollbarSize: 12
            }
        });
        editor.onDidChangeModelContent( (e) => { 
            if( onTextChanged ) onTextChanged( editor.getValue() );
        } );

        this._storeEditor( div, editor );

        return editor;
    }

    setText( div, text ){
        if( editors.has( div ) ) {
            let editor = editors.get( div );
            editor.getModel().setValue( text );
        }
    }

    removeEditor( div ) {
        if( editors.has( div ) ) {
            let editor = editors.get( div );
            editor.getModel().dispose();
            editors.delete( div );
        }
    }

    _storeEditor( div, editor ) {
        editors.set( div, editor );
    }

    hasEditor( div ) {
        return editors.has( div );
    }
}