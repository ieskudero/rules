export class Classes {
    constructor() {

    }

    async loadClass( classStr ) {
        const dataUri = 'data:text/javascript;base64,' + btoa(classStr);
        let module = await import( /* webpackIgnore: true */ dataUri );

        let keys = Object.keys( module );
        return { keys: keys, classes: keys.map( k => module[k] ) };
    }

    addClassesToWindowContext( classes ) {

        //classes is a json with { keys: [], classes: [] } format, containing class names in keys and classes in classes
        
        for (let i = 0; i < classes.keys.length; i++) {
            window[classes.keys[i]] = classes.classes[i];
        }

    }

    removeClassesFromWindowContext( classes ) {

        //classes is an array containing class names

        for (let i = 0; i < classes.length; i++) {
            let name = classes[i];
            if( window[ name ] ) delete window[ name ];
        }

    }
}