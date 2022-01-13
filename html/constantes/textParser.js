export class TextParser {
    constructor(){

        //text format:
        /*
            text can be number, string, array or json.
            if '[' is found we assume is an array
            if '{' is found we assume is a json
        */

        this.startTime = null;
    }

    _initialize( reject ) {
        this.startTime = new Date();
        this._reject = reject;
    }

    _exit() {
        let tooMuchTime = new Date() - this.startTime > 3000;
        if( tooMuchTime && this._reject ) {
            this._reject('WRONG FORMAT'); 
            delete this._reject;
        }

        return tooMuchTime;
    }

    async parse( text ) {
        try {
            return await new Promise( (resolve, reject) => {

                this._initialize( reject );
                    
                let data = this._tokenizeOne( text, 0 );
                if( data.i < text.length && typeof data.token === 'string' ) {
                    //a text can include ','. In that case we return the full text
                    resolve( { ok: true, parse: text } );
                }
                resolve( { ok: true, parse: data.token } );
            });
        }
        catch( error ) {
            return { ok: false, error: error };
        }
    }

    _parseArray( text ) {

        if( this._exit() ) return { tokens: '', index: text.length };

        //we assume the first letter is a '['
        let t = text.substring(1, text.length );

        //first thing first, we must get the array text. For that we found the corresponding ']'
        let data = this._getClosingChar( t, '[', ']' );

        //then we must tokenize all the elements
        let tokens = this._tokenize( t.substring( 0, data.index ) );
        
        let nextComma = text.substring(data.index, text.length).indexOf(',');

        //then we must parse all the tokens
        return { tokens: tokens, index: data.index  + (nextComma > 0 ? nextComma : 0) };
    }

    _parseJson( text ) {
        
        if( this._exit() ) return { json: '', index: text.length };

        let result = {};
        //we assume the first letter is a '{'
        let t = text.substring(1, text.length );

        //first thing first, we must get the array text. For that we found the corresponding ']'
        let data = this._getClosingChar( t, '{', '}' );

        t = t.substring( 0, data.index );

        //we get the key first
        for (let i = 0; i < t.length; i++) {

            if( this._exit() ) return { json: '', index: text.length };

            //find key
            let d = this._getFirstNoSpaceChar( t, i, ':' );
            if( d.index < 0 ) break;

            let key = t.substring( i, d.index ).trim();

            i = d.index + 1;
            //tokenize value
            let value = this._tokenizeOne( t.substring(i, t.length ), 0 );

            result[key] = value.token;
            i = i + value.i;
        }

        let nextComma = text.substring(data.index, text.length).indexOf(',');

        return { json: result, index: data.index  + (nextComma > 0 ? nextComma : 0) }
    }

    _parseTextOrNumber( text, i ) {
        let subtext = text.substring( i, text.length );
        let result = '';
        if( subtext.indexOf( ',' ) > -1 ) {
            for (let j = i; j < text.length; j++) {
                
                if( this._exit() ) return { value: '', index: text.length };

                const comma = text[j];
                if( comma === ',') {
                    let t = text.substring(i,j);
                    result = isNaN( t ) ? t : parseFloat( t );
                    i = j;
                    break;
                }
            }
        }
        else {
            result = isNaN( subtext ) ? subtext : parseFloat( subtext );
            i = text.length;
        }

        return { value: result, index: i }
    }

    _tokenize( text ) {

        if( this._exit() ) [];

        let tokens = [];
        //we get the text that is inside an array, so we start again seen if first letter is an object
        for (let i = 0; i < text.length; i++) {
            
            if( this._exit() ) [];

            let data = this._tokenizeOne( text, i );
            tokens.push( data.token );
            i = data.i;
        }
        return tokens;
    }

    _tokenizeOne( text , i ) {

        let result = null;
        
        //can be that there are white spaces
        let data = this._getFirstNoSpaceChar( text, i );
        if( data.char === '[' ) {
            let d = this._parseArray( text.substring( data.index, text.length ) );
            result = d.tokens;
            i = i + d.index + 1;
        }
        else if( data.char === '{' ) {
            let d = this._parseJson( text.substring( data.index, text.length ) );
            result = d.json;
            i = i + d.index + 1;
        } 
        else {
            let d = this._parseTextOrNumber( text, i );
            result = d.value;
            i = d.index;
        }

        return { token: result, i: i }
    }

    _getClosingChar( text, openingChar, closingChar, markCount ) {
        let count = typeof markCount === 'undefined' ? 1 : markCount;
        for (let i = 0; i < text.length; i++) {

            if( this._exit() ) return { text: '', index: -1 };

            const char = text[i];
            if( char === closingChar) {
                if( count === 1 ) return { text: text.substring(0, i), index: i };
                else count --;
            }
            else if( char === openingChar) count ++;
        }
    }

    _getFirstNoSpaceChar( text, index, specificChar ) {
        
        for (let i = index; i < text.length; i++) {

            if( this._exit() ) return { char: '', index: -1 };

            const char = text[i];
            if( char !== ' ' ) {
                if( typeof specificChar === 'undefined' || specificChar === char )
                    return { char: char, index: i }
            }
        }

        return { char: '', index: -1 };
    }
}