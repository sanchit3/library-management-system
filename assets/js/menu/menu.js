import view from '../common/render.js';
import Editor from './editor.js';
import Search from '../common/search.js';

class Menu extends Editor {
	constructor(collectionName) {
		super();
		init(collectionName, this);
		this.modifyUrl =
			'/modify' + (this.collectionName === 'student' ? 'stu' : 'book');

		this.search = new Search(this);
		this.initEventBindings();
	}

	initEventBindings() {
		let form = document.querySelector('#addEntity form');

		form.addEventListener('submit', event => {
			event.preventDefault();

			// we can use [...form] but that will be long shot
			this.inputs = Array.prototype.slice.call(form, 0, form.length - 1);

			if (!areInputsBlank(this.inputs, this.collectionName)) {
				return;
			}

			this.add();
		});

		this.search.registerForSearch(res => {
			view.renderTable(res);
		});
	}

	async add() {
		let payload = {};

		for (let inp of this.inputs) {
			payload[inp.name] = inp.value;
		}

		let res = await this.http.post('/add', payload);

		view.renderResponseMsg(res, this.displayName, {
			operationName: 'add'
		});
	}

	startEditing(entityId, btnRef) {
		let isEditing = JSON.parse(btnRef.dataset['isediting']),
			entityColumns = [],
			action = 'Editing';

		// allow one entity edit only
		if (this.currentEntity && this.currentEntity.uid != entityId) {
			alert(`Only one ${this.displayName} can be edit at one time`);
			return;
		}

		// add two btn save and cancel
		if (!isEditing) {
			$(btnRef).replaceWith(
				`<div class="btn-group actions-btn">
                    ${view.createBtn(entityId, 'save')}
                    ${view.createBtn(entityId, 'cancel')}
                </div>`
			);
		} else {
			// get to know either save or cancel is clicked
			action = $(btnRef)
				.html()
				.trim();
			// get parent div of the btn and replace with `edit button`
			$(btnRef)
				.parents('div.actions-btn')
				.replaceWith(view.createBtn(entityId, 'edit'));
		}

		// fetch inputs from current row
		$(`#ENTITY-${entityId} td`).each((index, td) => {
			let input = $(td).children('input')[0];

			if (input) {
				entityColumns.push(input);
			}
		});

		switch (action) {
			case 'Editing': // enable inputs for editing
				this.currentEntity = { uid: entityId };
				this.performOperation('editing', entityColumns);
				break;

			case 'Save': // save the data to server
				let payload = {};
				// prepare payload
				this.performOperation('save', entityColumns, payload);
				// send the payload to server for editing
				this.saveOrDelete('edit', payload, entityId).then(update => {
					this.performOperation('afterSave', entityColumns, update);
					this.currentEntity = null;
				});
				break;

			case 'Cancel': // restore the values
				// prepare payload
				this.performOperation('cancel', entityColumns);
				// reset the ref
				this.currentEntity = null;
				break;
		}
	}

	async saveOrDelete(mode, payload, entityId = false) {
		let modifiedEntity = null;

		// payload can be an object from `save operation` but from `del operation` payload is `entityId`
		if (mode === 'del') {
			entityId = payload;
			payload = {};
		}

		// setting entity (book/student) id to be use by the server
		if (this.collectionName === 'student') {
			payload.student_id = entityId.substring(entityId.indexOf('-') + 1);
		} else {
			payload.book_id = entityId;
		}

		let res = await this.http.post(
			`${this.modifyUrl}?mode=${mode}`,
			payload
		);

		modifiedEntity = await view.renderResponseMsg(res, this.displayName, {
			operationName: mode,
			entityId: entityId
		});

		// only for the save result
		return modifiedEntity;
	}
}

new Menu(location.pathname.includes('studentmenu') ? 'student' : 'book');
