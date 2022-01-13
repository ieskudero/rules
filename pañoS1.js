import { BombObject } from "./src/bombObject";
import { Pointer } from "./src/pointer";

export class PañoS1 {
    constructor(){
        //create perfil
        let perfil = new BombObject();

        //perfil izquierdo
        let pi = new Pointer( 'perfil_izquierdo', perfil );
        pi.before = `={ this.reference = 'U_ACERO' === 'U_ACERO' ? 57352 : 57350; }`;

        //perfil derecho
        let pd = new Pointer( 'perfil_derecho', perfil );
        pd.before = `={ this.reference = 'U_ACERO' === 'U_ACERO' ? 57352 : 57350; }`;

        //perfil superior
        let ps = new Pointer( 'perfil_superior', perfil );
        ps.before = `={ this.reference = 'U_ACERO' === 'U_ACERO' ? 57352 : 57350; }`;
        
        //perfil inferior
        let pin = new Pointer( 'perfil_inferior', perfil );
        pin.before = `={ 
            let str = 'U_ACERO';
            this.reference = str === 'U_ACERO' ? 57352 : ( str === null ? 57340 : 57350 ) ; 
        }`;
        
        //paño
        let paño = new BombObject();
        let p = new Pointer( 'paño', paño );

        //PañoS1
        let pañoS1 = new BombObject();
        pañoS1.name = 'Paño S1';
        
        //datos que debe tener el paño para hacer bien los cálculos
        pañoS1.sistema = 'S1';
        pañoS1.vidrio = '6x6'; // o 5x5. TODO: PREGUNTA HACIA EL USUARIO!!
        pañoS1.anchoTotal = 2200;
        pañoS1.altoTotal = 2500;

        pañoS1.pointers.push( pi, pd, ps, pin, p );
        //pañoS1.after = this._calculateAccesorios();

        this.p = pañoS1;
    }

    explode() { return this.p.explode(); }

    _calculateAccesorios() {
        return `={
            this.accesorios = [];
            
            //TORNILLOS T7504P3916
            let sum = 0;
            let type = 'unidad';
            let ref = 'T7504P3916';
            if( this.perfil_izquierdo.reference ) sum+=6;          //TODO: no sé cuantos son, añadir los que vayan por cada perfil
            if( this.perfil_derecho.reference ) sum+=6;          //TODO: no sé cuantos son, añadir los que vayan por cada perfil
            if( this.perfil_superior.reference ) sum+=6;          //TODO: no sé cuantos son, añadir los que vayan por cada perfil

            this.accesorios.push( { ref: ref, sum: sum, type: type } );

            //TORNILLOS T7505A435Z
            sum=0;
            ref = 'T7505A435Z';
            let type = 'unidad';
            if( this.perfil_inferior.reference ) sum+=6;          //TODO: no sé cuantos son, añadir los que vayan por cada perfil

            this.accesorios.push( { ref: ref, sum: sum, type: type } );

            //CALZOS
            let type = 'unidad';
            
            if( this.perfil_inferior.reference ) {
                this.accesorios.push( { ref: 'K142', sum: 2, type: type } );            //TODO: cuantos?
                this.accesorios.push( { ref: 'K143', sum: 2, type: type } );            //TODO: cuantos?
                this.accesorios.push( { ref: 'K144', sum: 2, type: type } );            //TODO: cuantos?
                this.accesorios.push( { ref: 'K145', sum: 2, type: type } );            //TODO: cuantos?
            }

            //TACO NYLON
            if( !getEstructura( 'ABAJO' ) ) {
                this.accesorios.push( { ref: 'TACO6', sum: 2, type: type } );            //TODO: cuantos?
            }

            //TODO: calcular cintas adhesivas ():
                type = 'mlineal'
                1.- calcular la cantidad de cintas. FORMULA:
                    let cantidad_cintas = ( cantidad_paños_interiores - 1) + ( si_encuentro_izquierda_paño ? 1 : 0) + ( si_encuentro_izquierda_paño ? 1 : 0) 
                    sum = ALTURA_PAÑOS * cantidad_cintas.
                2.- según vidrio poner la referencia adecuada
                    ref = this.vidrio === '6x6' ? '275509' : '275507';
                    
                this.accesorios.push( { ref: ref, sum: sum, type: type } );
            
            //TODO: calcular goma acristalado 
            //TODO: calcular guiadores, aunque creo que esto debería ir en estructura o container.
        }`
    }

}

/*
//PREGUNTAS PARA HACER A ISRAEL:

1.- Cuantas unidades van por cada accesiorio? tornillos, tacos ...
2.- Todo accesorio que tenga metro lineal como unidad, es un sumatorio de cada grupo? si un paño tiene cintas, se suman a los metros de otro paño para obtener el total?

*/