import { TabManager } from './html/tabManager.js';

//SOURCE
import { Item } from './src/item.js';
import { GeometryItem } from './src/geometryItem.js';
import { Pointer } from './src/pointer.js';
import { BombObject } from './src/bombObject';
import { FormItem } from './src/formItem';
import { ItemParser } from './src/itemParser';
import { Classes } from './src/classes';
import Constantes from './src/constantes';

import { TestsBombs } from './testsBombs.js';
import { Tests } from './tests.js';

import { data } from './util/dataSingleton'; 
import { Rule } from './util/rule.js';
import { TextParser } from './html/constantes/textParser.js';
import { TestTextParser } from './html/constantes/testTextParser.js';

class Main{

    constructor() {

        /*
        let rule = new Rule();
        rule.name = 'pañoS1';
        rule.description= 'descripción de regla de paños1';

        //PERFIL
        let perfil = new BombObject();
        perfil.ancho = 50;
        perfil.referencia=`={
            if( this.parent.sistema === 'S1' ) return 30752;
            else return 30750;
        }`;
        //PUNTERO A PERFIL IZQUIERDO
        let pointer = new Pointer('perfil_izquierdo', perfil);

        //PAÑO
        let paños1 = new BombObject();
        paños1.name = 'PañoS1';
        paños1.sistema = 'S1';
        paños1.pointers.push(pointer);

        rule.rule = paños1.toJSON();
        data.saveRule( rule.toJSON(), (saved) => {
            console.log( saved );
        });*/

        document.addEventListener("DOMContentLoaded", async function( e ) { 
            this.tab = new TabManager();
            await this.tab.init();
            this.tab.addInteraction( 'tablinks', 'tabcontent' );
            
            //await new Tests().launchTests();
            //await new TestsBombs().launchTests();
            //await new TestTextParser().launchTests();
        });
    }
}

var main = new Main();

//TODO LO QUE ESTÉ EN SOURCES y QUE PODAMOS USAR
export { Item,
         GeometryItem,
         Pointer,
         BombObject,
         FormItem as ItemForm,
         ItemParser,
         Classes,
         Constantes  
};



