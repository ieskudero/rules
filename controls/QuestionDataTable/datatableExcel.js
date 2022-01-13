import { DataTable } from 'digicon-web-datatables/dataTable.js';

export class DatatableExcel extends DataTable {
	
	//EACH CELL STRUCTURE MUST BE A JSON CONTAINING VALUE DATA
	
	constructor( props, tableData ) { 
		super( props, tableData ); 

		//add input text changed handlers
		this._addTextChangedHandlers();
	}
	
	_addTextChangedHandlers() {
		this.container.querySelectorAll('.inputAction').forEach((changeElement) => {
			changeElement.addEventListener('input', (e) => {
				e.currentTarget.dataset.value = e.currentTarget.value;
				this._onAction({ action: 'changeAction', event: e });
			});
		});
	}

	//@override
	_searchValue(obj, searchKeys, values) {
		var retorno = false;
		for (var i = 0; i < searchKeys.length; i++) {
			for (var j = 0; j < values.length; j++) {
				let value = obj[searchKeys[i]].value ? obj[searchKeys[i]].value : obj[searchKeys[i]];
				if ( value.toString().toLowerCase().indexOf(values[j].toLowerCase()) > -1 ) {
					retorno = true;
					break;
				}
			}
			if( retorno ) break;
		}
		return retorno;
	}
	
	//@override
	_sortData(data) {
		if (data.data[0]) {
			let keys = Object.keys(data.data[0]);
			data.data = data.data.sort((a, b) => {
				let index = this.sortIndex ? this.sortIndex : 0;
				let avalue = a[keys[index]].value ? a[keys[index]].value : a[keys[index]];
				let bvalue = b[keys[index]].value ? b[keys[index]].value : b[keys[index]];
				if (avalue > bvalue) {
					return this.sortDirection;
				}
				if (avalue < bvalue) {
					return -this.sortDirection;
				}
				return 0;
			});
		}
	}
	
	static createInputCell( value, enabled ) {
		return { value: value, input: true, enabled: enabled ? '' : 'disabled' };
	}
	static createCheckboxCell( check, enabled ) {
		return { checkbox: true, checked: check ? 'checked' : '', enabled: enabled ? '' : 'disabled' };
	}
	
	//each option structure: { v: value, d: description }
	static createSelectCell( options, selectedIndex, enabled ) {
		let cell = { select: true, options: [], enabled: enabled ? '' : 'disabled' };
		for ( var i = 0; i < options.length; i++ ) {
			cell.options.push( {
				v: options[i].v,
				d: options[i].d,
				selected: selectedIndex === i ? 'selected' : ''
			});
		}
		return cell;
	}
	
	static createButtonCell( label, enabled ) {
		return { value: label === '' ? ' ... ' : label, title: label, button: true, enabled: enabled ? '' : 'disabled' };
	}

	static range(start, end) {
		return Array(end - start + 1).fill().map((_, idx) => start + idx);
	}
}