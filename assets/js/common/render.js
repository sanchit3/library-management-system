function renderTable(
	dataList,
	btnType = 'default',
	tableType = 'default',
	fieldsProjection = false
) {
	let table =
			tableType != 'default'
				? $('#recTable tbody')
				: $('#listTable tbody'),
		html = '',
		menuNames = [
			// order matter to show in the table body
			'uid',
			'name',
			'email',
			'author',
			'branch',
			'quantity',
			'stock'
		],
		recordNames = [
			// order matter to show in the table body
			'student_id',
			'issue_id',
			'book_name',
			'branch',
			'issue_date',
			'return_date',
			'fine'
		];

	if (tableType === 'returnBookTable' || tableType === 'homeSearchTable') {
		recordNames[0] = 'issue_id';
		recordNames[1] = 'book_id';
	}

	if (tableType === 'returnBookTable' || tableType === 'recordTable') {
		recordNames.splice(recordNames.indexOf('branch'), 1);
	}

	if (tableType != 'default') {
		// as we will get 2d array of each book having different records
		dataList.forEach(({ record }) => {
			html += createTable(record, recordNames, {
				tableType,
				btnType
			});
		});
	} else {
		html = createTable(dataList, menuNames, {
			tableType,
			btnType
		});
	}

	table.html(html);
}

function createTable(dataList, itemsName, options) {
	let html = '',
		{ tableType, btnType } = options;

	dataList.forEach(entity => {
		// in case of book return there is no `uid` just `issue_id` is present
		if (tableType === 'returnBookTable') {
			entity.uid = entity.issue_id;
		}

		html += `<tr id='ENTITY-${'uid' in entity ? entity.uid : ''}'>`;

		for (let key of itemsName) {
			if (key in entity) {
				if (
					tableType &&
					(key === 'issue_date' || key === 'return_date')
				) {
					entity[key] = new Date(entity[key]).toLocaleDateString();
				}

				html += `<td>
                            <input
                                disabled name="${key}" 
                                class="table-custom-input" 
                                value="${entity[key]}"
                            /> 
                        </td>`;
			}
		}

		if (
			btnType != 'noBtn' &&
			(tableType === 'default' || tableType === 'returnBookTable')
		) {
			html += decideAndCreateBtn(btnType, entity.uid);
		}

		html += `</tr>`;
	});

	return html;
}

function decideAndCreateBtn(btnType, entityId) {
	let html = '';

	if (btnType === 'default') {
		// edit button
		html += `<td>${createBtn(entityId, 'edit')}</td>`;
		// remove button
		html += `<td> ${createBtn(entityId, 'remove')}</td>`;
	} else {
		html = `<td> ${createBtn(entityId, btnType)}</td>`;
	}

	return html;
}

async function renderResponseMsg(res, collectionName, options) {
	let alertType = 'danger',
		alertHeading = 'Something went wrong',
		alertMsg = 'Please try again or server is down',
		modifiedEntity = null;

	let { entityId, operationName } = options;

	let operation = {
		add: {
			dispText: 'added',
			async run() {
				alertMsg = `
                    ${collectionName} 
                    ${collectionName === 'Student' ? 'library' : ''} 
                    id is ${respText}
                `;
			}
		},

		del: {
			dispText: 'removed',
			async run() {
				$(`#ENTITY-${entityId}`).remove();
			}
		},

		edit: {
			dispText: 'modified',
			async run() {
				modifiedEntity = await res.json();
			}
		}
	};

	// as res can be use only one time otherwise it will locked
	let respText = await res.clone().text();

	if (res.status === 200) {
		if (respText.match('Failed')) {
			alertHeading = `${collectionName} cannot be ${
				metadata[operation].dispText
			}`;

			alertMsg = respText;
		} else {
			alertType = 'success';
			alertHeading = `
            ${collectionName} 
            ${operation[operationName].dispText} 
            sucessfully`;

			// will be override by the `add operation`
			alertMsg = ``;
			await operation[operationName].run();
		}
	} else {
		alertHeading = `Operation cannot be done`;

		alertMsg = 'Service unavailable';
	}

	showAlert(alertType, alertHeading, alertMsg);

	return modifiedEntity;
}

function createBtn(entityId, type) {
	let btnCls = {
			edit: 'primary',
			save: 'success',
			cancel: 'warning',
			remove: 'danger',
			return: 'link',
			record: 'link'
		},
		arg = '';

	if (type === 'remove') {
		arg = 'del';
	} else if (type === 'save' || type === 'cancel' || type === 'edit') {
		arg = 'edit';
	} else if (type === 'return') {
		arg = 'return';
	} else if (type === 'record') {
		arg = 'record';
	}

	let isEditing = type === 'edit' ? 'false' : 'true';

	const html = `<button class="btn btn-${btnCls[type]}" 
                    data-isEditing="${isEditing}" 
                    onclick="btnAction('${entityId}', '${arg}', this)">
                    ${type.charAt(0).toUpperCase()}${type.slice(1)}
                </button>`;

	return html;
}

export default {
	renderTable,
	renderResponseMsg,
	createBtn
};
