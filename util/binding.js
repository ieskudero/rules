
//class to bind html elements with json objects

var cache = [];

export function Bind( item ) {
  
    let orgs = cache.filter( o => o.item === item );
    if( orgs.length === 0 )
      cache.push( { uuid: item.uuid, originals: [] } ); 

    return new Proxy(item, {
        get: function(target, prop) {
          console.log({ type: 'get', target, prop });
          return Reflect.get(target, prop);
        },
        set: function(target, prop, value) {
          _setNameValue( target, prop, value );
          return Reflect.set(target, prop, value);
        }
    });
}

function _setNameValue(target, prop, newValue) {
  if( prop !== 'name' ) return newValue;

  //get original value
  let originalValue = _getOriginalValue( target, prop );

  //get html controls
  let options = document.querySelectorAll([`option[data-uuid="${target.uuid}"]`]);
  let divs = document.querySelectorAll([`div[data-uuid="${target.uuid}"]`]);
  
  //assign/remove star
  if( originalValue !== newValue ) {
    for (let i = 0; i < options.length; i++) _setStarToHTML( options[i], target[prop], newValue );
    for (let i = 0; i < divs.length; i++) _setStarToHTML( divs[i], target[prop], newValue );
  }
  else{
    for (let i = 0; i < options.length; i++) _removeStarToHTML( options[i], target[prop], newValue );
    for (let i = 0; i < divs.length; i++) _removeStarToHTML( divs[i], target[prop], newValue );
  }
}

function _getOriginalValue ( target, prop ) {

  let cached = cache.filter( o => o.uuid === target.uuid )[0];
  let contains = cached.originals.filter( o => o.prop === prop );
  
  if( contains.length === 0 ) {
    cached.originals.push( { prop: prop, value: target[prop] } );
  }
  else return contains[0].value;

  return null;
}

export function updateOriginalValue( target, prop ) {
  let cached = cache.filter( o => o.uuid === target.uuid )[0];
  let contains = cached.originals.filter( o => o.prop === prop );
  
  if( contains.length === 0 ) return;

  //update original
  contains[0].value = target[prop];

  //remove star
  _setNameValue( target, prop, target[prop] );

}

function _setStarToHTML( html, oldValue, newValue ) {
  if( !html.innerText.startsWith('*') && html.innerText === oldValue ) 
      html.innerText = '*' + newValue;
    else if( html.innerText === '*' + oldValue ) 
      html.innerText = '*' + newValue;
}

function _removeStarToHTML( html, oldValue, newValue ) {
  if( html.innerText.startsWith('*') && html.innerText === '*' + oldValue ) 
  html.innerText = newValue;
}