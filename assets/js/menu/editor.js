export default class Editor {
	constructor() {
		// global event handler for action buttons `save, cancel and edit`
		// hoisting in the global space with the context of current class
		window.btnAction = window.btnAction.bind(this);
	}

	performOperation(operationName, entityColumns, extras) {
		let operation = {
			editing: input => {
				input.removeAttribute('disabled');
			},
			save: input => {
				input.setAttribute('disabled', true);
				extras[input.name] = input.value; // extras is actually `payload`
			},
			cancel: input => {
				input.setAttribute('disabled', true);
				input.value = this.currentEntity[input.name];
			},

			afterSave: input => {
				let updateRule = extras; // will contain updated entity
				let update = !updateRule ? this.currentEntity : updateRule;
				input.value = update[input.name];
			}
		};

		entityColumns.forEach(input => {
			if (input.name != 'uid' && input.name != 'stock') {
				operation[operationName](input);
			}

			// reset for the stock only in `afterSave` operation
			if (operationName === 'afterSave' && input.name === 'stock') {
				operation[operationName](input);
			}

			// store reference
			if (operationName === 'editing') {
				this.currentEntity[input.name] = input.value;
			}
		});
	}
}
