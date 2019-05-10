import view from './common/render.js';
import Search from './common/search.js';

class IssueBook {
	constructor(collectionName) {
		init(collectionName, this);
		this.search = new Search(this);

		this.search.registerForSearch(this.loadEntity, 'keyup', true);

		// hoisting in the global space with the current class context
		window.showDetail = IssueBook.showDetail.bind(this);
	}

	async loadEntity(term, type, msgBox, target) {
		let payload = {
				type: 'uid',
				term
			},
			msg = '';

		if (target.id === 'srchBook') {
			if (isNaN(+term)) {
				payload.type = 'name';
			}
			this.http.setApiPath('/book');
		} else {
			this.http.setApiPath('/student');
		}

		let res = await this.http.post('/search', payload);

		if (target.id === 'srchBook') {
			this.handleBook(res);
		} else {
			this.handleStudent(res);
		}
	}

	async handleBook(res) {
		let record = [],
			html = '';

		this.currentEntity = {
			book: null,
			student: null,
			allBooks: []
		};

		if (res.status === 200) {
			record = await res.json();
			if (!record.length) {
				$('#bookMsg').html(`<p class="text-danger">Book not found</p>`);
				return;
			}
		} else {
			$('#bookMsg').html(
				`<p class="text-danger">Service unavailable</p>`
			);
			return;
		}

		this.currentEntity.allBooks = record;
		record.forEach((book, index) => {
			html += `
                <li 
                    class="list-group-item list-group-item-action cur-pointer"
                    onclick="showDetail(${index}, 'book')">
                    ${book.name}
                </li>
               `;
		});

		$('#bookMsg').html(`<p class="text-success">Book(s) found</p>`);
		$('#displayBooks').html(html.trim());
	}

	async handleStudent(res) {
		let record = [],
			html = '';

		if (res.status === 200) {
			record = await res.json();

			if (!record.length) {
				$('#studentMsg').html(
					`<p class="text-danger">Student not found</p>`
				);
			} else {
				$('#studentMsg').html(
					`<p class="text-success">Student found</p>`
				);

				showDetail(record[0], 'student');
			}
		} else {
			$('#studentMsg').html(
				`<p class="text-danger" > Service unavailable</p >`
			);
		}
	}

	static showDetail(data, type) {
		let detailBoxRef = $(`#${type}DetailBox`),
			html = '';

		switch (type) {
			case 'book':
				let book = this.currentEntity.allBooks[data];

				html = `
                <p><strong>Book Id:</strong> ${book.uid}</p>
                <p><strong>Book Name:</strong> ${book.name}</p>
                <p><strong>Book Author:</strong> ${book.author}</p>
                <p><strong>Branch:</strong> ${book.branch}</p>
                <p><strong>Quantity:</strong> ${book.quantity}</p>
                <p><strong>Stock:</strong> ${book.stock}</p>
                `;

				if (+book.stock > 0) {
					this.currentEntity.book = book.uid;
				}

				$('#displayBooks').html('');
				break;

			case 'student':
				let student = data;

				html = ` <p><strong>Student Library Id:</strong> ${
					student.uid
				} </p>
                <p><strong>Student Name:</strong> ${student.name} </p>
                <p><strong>Branch:</strong>  ${student.branch}</p>`;

				this.currentEntity.student = student.rollno;
				break;
		}

		// check to see if we are ready to enable issue btn
		if (this.currentEntity.book && this.currentEntity.student) {
			$('#issueBtn')
				.removeAttr('disabled')
				.click(() => this.issueBook());
		}

		detailBoxRef.html(html.trim());
	}

	async issueBook() {
		$('#issueBtn').attr('disabled', 'disabled');

		let payload = {
			book_id: this.currentEntity.book,
			student_id: this.currentEntity.student
		};

		this.http.setApiPath('book');

		let res = await this.http.post('/issue', payload);

		if (res.status === 200) {
			let issueId = await res.text(),
				alertType = 'success',
				alertHeading = 'Book Issued Successfully',
				alertMsg = '';

			if (issueId.match('ALREADY')) {
				alertType = 'danger';
				alertHeading = 'Book issue operation failed';
				alertMsg = issueId;
				$('#issueBtn').removeAttr('disabled');
			} else {
				alertMsg = `The book issue id is ${issueId}`;
				this.currentEntity = {};
			}

			showAlert(alertType, alertHeading, alertMsg);
		} else {
			alert('Server is not responding.Please try later');
		}
	}
}

new IssueBook('student');
