import { Classes } from './src/classes.js';
import Constantes from './src/constantes.js';
import { Pointer } from './src/pointer.js';
import { BombObject } from './src/bombObject.js';

export class TestsBombs {
    constructor() {

    }

    async launchTests() {
        let names = Object.getOwnPropertyNames (Object.getPrototypeOf (this));
        let filtered = names.filter(propName => ( propName !== 'constructor' && /* remove constructor */
                                                  propName !== 'launchTests' && /* remove own call */
                                                  typeof this[propName] === 'function'));
        for (let i = 0; i < filtered.length; i++) {
            const methodName = filtered[i];
            if( !methodName.startsWith('_') ) await this[methodName]();
        }
    }

    Test() {
        console.log( '--------------EXPLODE NEW PROPERTY ADDED TO AN BOMB-------------------');
        let perfil = new BombObject();
        perfil.sistema = 'S1';
        perfil.sistema_preferido = `={
            return this.sistema === 'S1' ? this.sistema : null;
        }`
        var exploded = perfil.explode();

        //exploded.reference should be resolved, with a value of 50
        console.log( exploded.sistema_preferido === 'S1' ? 'CORRECT' : 'ERROR' );
    }
    TestPointer() {
        console.log( '--------------TEST POINTER USE-------------------');
        
        let paños1 = this._createPañoS1();

        var exploded = paños1.explode();

        //exploded.reference should be resolved, with a value of 50
        console.log( exploded.perfil_izquierdo.reference === 30752 ? 'CORRECT' : 'ERROR' );
    }

    TestPointerFormula() {
        console.log( '--------------TEST POINTER FORMULA-------------------');
        
        let paños1 = this._createPañoS1();
        paños1.pointers[0].before = '=this.reference = 5;';

        var exploded = paños1.explode();

        //exploded.reference should be resolved, with a value of 50
        console.log( exploded.perfil_izquierdo.reference === 5 ? 'CORRECT' : 'ERROR' );
    }

    TestAttributes() {
        console.log( '--------------TEST ATTRIBUTES USE-------------------');
        
        let paños1 = this._createPañoS1();
        delete paños1.sistema;
        paños1.attributes.push( {
            name:'sistema',
            value: 'S1'
        } );
        var exploded = paños1.explode();

        //exploded.reference should be resolved, with a value of 50
        console.log( exploded.perfil_izquierdo.reference === 30752 ? 'CORRECT' : 'ERROR' );
    }
    
    _createPañoS1() {
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
        paños1.sistema = 'S1';
        paños1.pointers.push(pointer);

        return paños1;
    }

}