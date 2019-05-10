import view from './common/render.js';
import Search from './common/search.js';

class FineChecker {
	constructor(collectionName) {
		init(collectionName, this);
		this.search = new Search(this);

		this.search.registerForSearch(this.loadIssueRecord, 'click', true);

		// global event handler for action button `record`
		// hoisting in the global space with the current class context
		window.btnAction = window.btnAction.bind(this);
	}

	async loadIssueRecord(term, type, msgBox) {
		let payload = {
				type,
				term
			},
			msg = `<p class="text-danger">No record found</p>`;

		if (type === 'sid') {
			payload.type = 'student_id';
		} else if (type === 'bid') {
			payload.type = 'book_id';
		} else if (!type.trim().length) {
			// show all
			payload.type = 'all';
		}

		let res = await this.http.post('/finechecker', payload);

		if (res.status === 200) {
			let text = await res.clone().text();

			if (!text.match('Failed')) {
				let record = await res.json();

				if (record.length) {
					this.displayDetail(record, type);
					view.renderTable(record, 'noBtn', 'fineTable');
					msg = `<p class="text-success">Record found</p>`;
				}
			}
		} else {
			msg = `<p class="text-danger">Service unavailable</p>`;
		}

		msgBox.html(msg);
	}

	displayDetail(record, type) {
		let totalFine = 0,
			detailBox = $('#detailBox'),
			displayName = record[0].name,
			html = '';

		type = type.trim();

		// in case of branch the server does not send the name of branch
		if (type === 'branch') {
			displayName = $('#searchInput')
				.val()
				.trim();
		}

		// calculate fine
		if (type !== 'branch' && type !== 'book_name' && type.length != 0) {
			totalFine = record[0].totalFine;
		} else {
			record.forEach(b => {
				totalFine += b.totalFine;
			});
		}

		let titleNames = {
			bid: 'Book',
			sid: 'Student',
			branch: 'Branch'
		};

		// diaply name will not show for `book name` and when all record is shown
		if (type != 'book_name' && type.length != 0) {
			html = `<p><strong>${
				titleNames[type]
			} Name:</strong> ${displayName}</p>`;
		}

		html += `<p><strong>Total Fine:</strong> ${totalFine}</p>`;

		detailBox.html(html);
	}
}

new FineChecker('book');
