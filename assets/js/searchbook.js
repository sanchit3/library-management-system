import view from './common/render.js';
import Search from './common/search.js';

class SearchBook {
	constructor(collectionName) {
		init(collectionName, this);
		this.search = new Search(this);

		this.search.registerForSearch(res => {
			view.renderTable(res, 'record');
		});

		// global event handler for action button `record`
		// hoisting in the global space with the current class context
		window.btnAction = window.btnAction.bind(this);
	}

	async loadIssueRecord(entityId) {
		let payload = {
			type: 'book_id',
			term: entityId
		};

		let res = await this.http
			.post('/finechecker', payload)
			.then(res => res.json());

		if (!res.length) {
			alert('No record found');
			return;
		}

		let bname = res[0].name,
			totalFine = res[0].totalFine;

		$('.modal-body div.book-info').html(
			`<p><strong>Book Id: </strong> ${entityId}</p>
            <p><strong>Book Name: </strong> ${bname}</p>
            <p><strong>Total Fine: </strong> ${totalFine}</p>`
		);

		view.renderTable(res, 'default', 'recordTable');
		$('#recordModal').modal('show');
	}
}

new SearchBook('book');
