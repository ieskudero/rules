import { Classes } from './src/classes.js';
import Constantes from './src/constantes.js';
import { BombObject } from './src/bombObject.js';

export class Tests {
    constructor() {

    }

    async launchTests() {
        let names = Object.getOwnPropertyNames (Object.getPrototypeOf (this));
        let filtered = names.filter(propName => ( propName !== 'constructor' && /* remove constructor */
                                                  propName !== 'launchTests' && /* remove own call */
                                                  typeof this[propName] === 'function'));
        for (let i = 0; i < filtered.length; i++) {
            const methodName = filtered[i];
            await this[methodName]();
        }
    }

    Test() {
        console.log( '--------------SHOW DEFINITION/EXPLODED OBJECTS-------------------');
        let perfil = new BombObject();
        perfil.reference = '=this.margin.left';
        perfil.margin.left = 50;
        var exploded = perfil.explode();

        //exploded.reference should be resolved, with a value of 50
        console.log( perfil );
        console.log( exploded );
    }

    TestFormula() {
        console.log( '--------------CHECK SIMPLE FORMULA-------------------');

        let perfil = new BombObject();

        perfil.reference = '=this.margin.left';
        perfil.margin.left = 50;
        let exploded = perfil.explode();

        console.log( exploded.reference === 50 ? 'CORRECT' : 'ERROR' );
    }

    TestMethodFormula() {
        console.log( '--------------CHECK METHOD FORMULA-------------------');

        let perfil = new BombObject();

        perfil.reference = `={ 
            if( this.margin.left === 50) { 
                this.margin.top = 15;
            } 
            return 1000;
        }`;
        perfil.margin.left = 50;
        let exploded = perfil.explode();

        console.log( exploded.margin.top === 15 && exploded.reference === 1000 ? 'CORRECT' : 'ERROR' );
    }

    TestNestedFormula() {
        console.log( '--------------CHECK NESTED FORMULA-------------------');

        let perfil = new BombObject();

        perfil.reference = '=this.margin.left';
        perfil.margin.left = 50;
        perfil.margin.right = '=this.margin.left - 25;';
        let exploded = perfil.explode();

        console.log( exploded.margin.right === 25 ? 'CORRECT' : 'ERROR' );
    }

    TestConsoleLog() {
        console.log( '--------------CHECK CONSOLE LOG-------------------');

        let perfil = new BombObject();

        perfil.reference = '=console.log("LOGGING->" +  this.margin.left);';
        perfil.margin.left = 50;
        perfil.explode();

        console.log( 'CORRECT' );
    }

    TestConstants() {
        console.log( '--------------CHECK CONSTANT USAGE-------------------');

        let perfil = new BombObject();
        perfil.margin.right= '=Constantes.COLOR;';
        let exploded = perfil.explode();

        console.log( exploded.margin.right === Constantes.COLOR ? 'CORRECT' : 'ERROR' );
    }
    

    TestBefore() {
        console.log( '--------------CHECK BEFORE FORMULA-------------------');

        let perfil = new BombObject();
        perfil.margin.left = 50;
        perfil.margin.right= '=this.margin.left;';
        perfil.before = '=this.margin.left = 25;';
        let exploded = perfil.explode();

        console.log( exploded.margin.right === 25 ? 'CORRECT' : 'ERROR' );
    }

    TestAfter() {
        console.log( '--------------CHECK AFTER FORMULA-------------------');

        let perfil = new BombObject();
        perfil.margin.left = 50;
        perfil.margin.right= '=this.margin.left;';
        perfil.after = '=this.margin.right = 5;';
        let exploded = perfil.explode();

        console.log( exploded.margin.right === 5 ? 'CORRECT' : 'ERROR' );
    }

    TestJSON() {
        console.log( '--------------CHECK JSON EXPLODE-------------------');

        let json = {
            ref: 15,
            val: {
                aa: 5,
                bb: '=this.ref;'
            }
        }
        new BombObject()._explodeValue(json, json);

        console.log( json.val.bb === json.ref ? 'CORRECT' : 'ERROR' );
    }

    async TestClassMethod() {
        console.log( '--------------CHECK METHOD IMPORT-------------------');
        let classStr = `export function Sum(a,b) { return a + b; }`
        let classes = new Classes();
        let parsed = await classes.loadClass( classStr );
        classes.addClassesToWindowContext( parsed );

        let perfil = new BombObject();
        perfil.margin.left = `=Sum(5,10);`;
        let exploded = perfil.explode();
        
        console.log( exploded.margin.left === 15 ? 'CORRECT' : 'ERROR' );

        classes.removeClassesFromWindowContext( parsed.keys );
        
    }

    async TestClassImport() {
        console.log( '--------------CHECK IMPORT WITHIN IMPORT-------------------');
        let classStr = `import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.module.js';
            
                        export class CustomVector {
                            constructor() {
                                this.vector = new THREE.Vector3();
                                this.vector.set(15, 5, 10);
                            }
                        
                            init( ) {
                                console.log( this.vector );
                            }
                        }`
        let classes = new Classes();
        let parsed = await classes.loadClass( classStr );
        classes.addClassesToWindowContext( parsed );

        let perfil = new BombObject();
        perfil.margin.left = `={
            let v = new CustomVector();
            v.init();
            this.margin.right = v.vector.x;
            return 1000;
        }`;
        let exploded = perfil.explode();
        
        console.log( exploded.margin.left === 1000 && exploded.margin.right === 15 ? 'CORRECT' : 'ERROR' );

        classes.removeClassesFromWindowContext( parsed.keys );
        
    }

    async TestClassProjectClassImport() {
        /*
            IMPORTANT!!
            in order to export classes there are 2 things to do:
                1.- add correspondent library options in the output section of webpack config. This exports the bundled with library name (https://webpack.js.org/configuration/output/#outputlibrary)
                        library: ['library', '[name]'],
                        libraryTarget: "umd",
                        //NOTE: with one entry point we can simply set library: 'library', otherwise we must add as an array and set entry as json object. 
                                Each key will be deployed as library.key
                2.- add in main.js (or other entry point in webpack) the desired export classes (GeometryItem in the example)
        */
        console.log( '--------------CHECK PROJECT IMPORT WITHIN IMPORT-------------------');
        let classStr = `export class Triangle extends library.main.GeometryItem{
                            constructor() {
                                super();
                                this.margin.left = 15;
                            }
                        }`;
        let classes = new Classes();
        let parsed = await classes.loadClass( classStr );
        classes.addClassesToWindowContext( parsed );

        let perfil = new BombObject();
        perfil.margin.left = `={
            let instance = new Triangle();
            return instance.margin.left;
        }`;
        let exploded = perfil.explode();
        
        console.log( exploded.margin.left === 15 ? 'CORRECT' : 'ERROR' );

        classes.removeClassesFromWindowContext( parsed.keys );
        
    }

}