/** Common methods of the dashboard section */

// http service
class Http {
	constructor(routeName) {
		this.setApiPath(routeName);
	}

	setApiPath(pathName) {
		this.api = `/api/${pathName}`;
	}

	post(pathName, data) {
		let url = this.api + `${pathName}`;
		let body = new FormData();

		// prepare form data
		for (let key in data) {
			body.append(key, data[key]);
		}

		return fetch(url, {
			method: 'POST',
			body: new URLSearchParams([...body])
		});
	}
}

// initial values setter
function init(collectionName, context) {
	context.collectionName = collectionName;
	context.displayName =
		collectionName.charAt(0).toUpperCase() + collectionName.slice(1);
	context.http = new Http(context.collectionName);
	context.currentEntity = null;
}

// to ensure inputs are not blank
function areInputsBlank(inputs, collectionName) {
	for (let inp of inputs) {
		if (!inp.value.trim().length) {
			showAlert(
				'danger',
				`Not able to add ${collectionName}`,
				'Some fields are blank in the form'
			);
			return false;
		}
	}

	return true;
}

// btn actions manager
// must be bind by the class instance to use
function btnAction(entityId, operation, ref) {
	switch (operation) {
		case 'edit':
			this.startEditing(entityId, ref);
			break;

		case 'del':
			this.saveOrDelete('del', entityId);
			break;

		case 'record':
			this.loadIssueRecord(entityId);
			break;

		case 'return':
			this.returnBook(entityId);
	}
}

// function to display alert msg
function showAlert(type, heading, msg) {
	let colors = ['success', 'danger'];

	if (type === 'danger') {
		colors = colors.reverse();
	}

	$('#alertMsg')
		.toggleClass('hide')
		.toggleClass('show')
		.addClass(`alert-${colors[0]}`)
		.removeClass(`alert-${colors[1]}`);

	let html = `<strong>${heading}</strong>.&nbsp;${msg}`;
	$('#alertMsg div').html(html);
}

// alert disissible part
const alertBox = document.querySelector('.alert-dismissible button');

if (alertBox) {
	alertBox.addEventListener('click', event => {
		$(event.target)
			.parents('.alert-dismissible')
			.toggleClass('hide')
			.toggleClass('show');
	});
}

// sidebar section highlight
(() => {
	document.querySelectorAll('.custom-border a').forEach(a => {
		if (a.getAttribute('href') === location.pathname) {
			a.classList.add('active');
		}
	});
})();

// to display date and time on index page of dashboard
document.body.onload = () => {
	if (location.pathname === '/dashboard') {
		// display clock on index page
		let td = document.querySelector('#time_display');
		setInterval(() => {
			let date = new Date();
			td.innerHTML = `<strong class="text-success">Date</strong> ${date.toDateString()} | <strong class="text-success">Time</strong> ${date.toLocaleTimeString()}`;
		}, 1000);
	}
};
