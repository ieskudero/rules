import { Pointer } from '../../src/pointer.js';
import { BombObject } from '../../src/bombObject';
import { FormItem } from '../../src/formItem';

export class TestForms {
    constructor( containerId ) {

        //create item
        let item = this._createItem();

        let form = new FormItem();
        
        this._addQuestions( form );

        form.toHTML( containerId, item );
    }

    _createItem() {
        //PERFIL
        let perfil = new BombObject();
        perfil.ancho = 50;
        perfil.reference=`={
            if( this.parent.sistema === 'S1' ) return 30752;
            else return 30750;
        }`;
        //PUNTERO A PERFIL IZQUIERDO
        let pointer = new Pointer( 'perfil_izquierdo', perfil );

        //PAÑO
        let paños1 = new BombObject();
        paños1.name = 'PañoS1';
        paños1.sistema = 'S1';
        paños1.pointers.push(pointer);

        return paños1;
    }

    _addQuestions( form ) {

        form.questions.push( 
            {
                question: 'inserte un número:',
                code: 'numero',
                type: FormItem.TYPES.number,
                before: '',
                after: ''
            },
            {
                question: 'inserte un texto:',
                code: 'texto',
                type: FormItem.TYPES.text,
                before: '',
                after: ''
            },
            {
                question: 'es verdadero o falso?',
                code: 'verdadero',
                type: FormItem.TYPES.bool,
                before: '',
                after: ''
            },
            {
                question: 'elija un coche',
                code: 'coche',
                type: FormItem.TYPES.combo,
                control_data: [ { name: 'v', value: 'volvo' }, { name: 'f', value: 'ford' }, { name: 'fe', value: 'ferrari' }],
                before: '',
                after: ''
            },
        );
        form.after =`={
            this.numero.value = this.numero.value - 5;
            this.verdadero.value = true;
            //this.coche.value = 'f';
            this._generateHTML();            
        }`;
    }

}