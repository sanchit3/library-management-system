import view from './common/render.js';
import Search from './common/search.js';

class ReturnBook {
	constructor(collectionName) {
		init(collectionName, this);
		this.search = new Search(this);

		this.search.registerForSearch(this.loadIssueRecord, 'keyup', true);

		// global event handler for action button `return`
		// hoisting in the global space with the current class context
		window.btnAction = window.btnAction.bind(this);
	}

	async loadIssueRecord(term, type, msgBox) {
		let payload = {
				type: 'student_id',
				term
			},
			msg = `<p class="text-danger">No record found</p>`;

		let res = await this.http.post('/finechecker', payload);

		if (res.status === 200) {
			let text = await res.clone().text();

			if (!text.match('Failed')) {
				let record = await res.json();

				if (record.length) {
					this.displayDetail(record);
					view.renderTable(record, 'return', 'returnBookTable');
					msg = `<p class="text-success">Record found</p>`;
				}
			}
		} else {
			msg = `<p class="text-danger">Service unavailable</p>`;
		}

		msgBox.html(msg);
	}

	async returnBook(issueId) {
		let payload = {
			issue_id: issueId
		};

		let res = await this.http.post('/return', payload);

		if (res.status === 200) {
			let text = await res.text();

			if (text.match('success')) {
				showAlert(
					'success',
					'Book Returned Successfully',
					`The book issue id was ${issueId}`
				);
				$(`#ENTITY-${issueId}`).remove();
			} else {
				showAlert('danger', 'Book Return Failed', text);
			}
		} else {
			alert('Server is not responding.Please try later');
		}
	}

	displayDetail(record) {
		let detail = record[0].record;

		let totalFine = record[0].totalFine,
			detailBox = $('#detailBox'),
			displayName = record[0].name,
			html = '',
			id = detail[0].student_id,
			branch = detail[0].branch;

		html = ` <p><strong>Student Id:</strong> ${id} </p>
                <p><strong>Student Name:</strong> ${displayName} </p>
                <p><strong>Branch:</strong>  ${branch}</p>
		        <p><strong>Total Fine:</strong> ${totalFine}</p>`;

		detailBox.html(html);
	}
}

new ReturnBook('book');
