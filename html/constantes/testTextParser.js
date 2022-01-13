import { TextParser } from "./textParser";

export class TestTextParser {
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

    async TestArray() {
        console.log( '--------------PARSE TEST WITH ARRAY-------------------');
        
        let text = '[hamabost, 15, { arr: [ 15, zemat ] , tutu: { id: 5 } }, daleeee ]';
        let parse = await new TextParser().parse( text );

        console.log( text );
        console.log( parse.ok ? parse.parse : parse.error );
    }
    
    async TestJson() {
        console.log( '--------------PARSE TEST WITH JSOn-------------------');
        
        let text = '   { aa: aberba }';
        let parse = await new TextParser().parse( text );

        console.log( text );
        console.log( parse.ok ? parse.parse : parse.error );
    }    
    
    async TestText() {
        console.log( '--------------PARSE TEST WITH TEXT-------------------');
        
        let text = 'hamabost, 5';
        let parse = await new TextParser().parse( text );

        console.log( text );
        console.log( parse.ok ? parse.parse : parse.error );
    }    
    
    async TestNumber() {
        console.log( '--------------PARSE TEST WITH NUMBER-------------------');
        
        let text = '5';
        let parse = await new TextParser().parse( text );

        console.log( text );
        console.log( parse.ok ? parse.parse : parse.error );
    }
}