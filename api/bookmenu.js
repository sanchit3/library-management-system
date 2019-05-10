const Menu = require('./menu');
const quantityManager = require('./qty_manager');

class Book extends Menu {
	constructor() {
		super();
		this.collectionName = 'books';
	}

	async add(data) {
		let result = {
			ok: 0
		};

		try {
			var client = await this.mongo();

			const counter = await client.db
				.collection('counters')
				.findOneAndUpdate(
					{ name: 'book_id' },
					{ $inc: { seq: 1 } },
					{ returnOriginal: false, projection: { seq: 1 } }
				);

			if (counter.ok) {
				data.uid = counter.value.seq;
			} else {
				throw new Error('cannot able to get an id for book');
			}

			// extras

			data.quantity = +data.quantity;

			data.stock = data.quantity;
			data.record = [];
			for (let index = 1; index <= data.stock; index += 1) {
				data.record.push({
					id: index,
					isIssued: false
				});
			}

			result = await this.insert(client, data);
		} catch (error) {
			console.log(error, 'api: book add<database error>');
		} finally {
			client && client.close();
		}

		return result;
	}

	async performChecksBeforeIssue(data, failOnError = true) {
		let status = {
			msg: null,
			data: [],
			fail: true
		};

		// check student exists
		let studentFound = await this.search(
			data.student_id,
			{
				type: 'rollno',
				inst_id: data.inst_id
			},
			'students'
		);

		if (!studentFound.length && failOnError) {
			status.msg = 'STUDENT NOT FOUND';
			return status;
		}

		status.data.push({
			student: studentFound
		});

		status.studentFound = studentFound;

		// check book exists
		let bookFound = await this.search(
			data.book_id,
			{ type: 'uid', inst_id: data.inst_id },
			'books'
		);

		if (!bookFound.length && failOnError) {
			status.msg = 'BOOK NOT FOUND';
			return status;
		}

		status.data.push({
			book: bookFound
		});

		try {
			var client = await this.mongo();

			// check book already issued to student
			var isAlredyIssued = await client.db
				.collection('issue_record')
				.findOne({
					$and: [
						{ book_id: +data.book_id },
						{ student_id: studentFound[0].rollno }
					]
				});
		} catch (error) {
			console.log(error, `issue_record cannot able to perform search`);
		} finally {
			client && client.close();
		}

		if (isAlredyIssued && failOnError) {
			status.msg = 'BOOK ALREADY ISSUED';
			return status;
		}

		status.book = bookFound;
		status.fail = false;

		return status;
	}

	async issue(data) {
		let result = {
			ok: 0
		};
		try {
			// perform checks before issue a book
			let status = await this.performChecksBeforeIssue(data);

			if (status.fail) {
				result.msg = status.msg;
				return result;
			}

			let { book: bookFound, studentFound } = status;

			// find the available book to issue
			let records = bookFound[0].record,
				availableBook = false;

			for (const index in records) {
				let book = records[index];

				if (!book.isIssued) {
					availableBook = book;
					break;
				}
			}

			if (!availableBook) {
				result.msg = 'BOOK OUT OF STOCK';
				return result;
			}

			var client = await this.mongo();

			//extras
			data.book_name = bookFound[0].name;
			data.branch = bookFound[0].branch;

			// date calculation
			let d = new Date();
			data.issue_date = new Date();
			data.return_date = new Date(d.setDate(d.getDate() + 15));

			data.book_id = +data.book_id;
			data.issue_id = `${data.book_id}B${studentFound[0].uid}S${
				availableBook.id
			}`;

			result = await this.insert(client, data, 'issue_record');

			if (result.ok) {
				// update the book with issue id
				availableBook.isIssued = data.issue_id;

				// update the book stock
				let stockUpdated = await client.db
					.collection('books')
					.findOneAndUpdate(
						{ uid: data.book_id },
						{
							$inc: { stock: -1 },
							$set: {
								[`record.${availableBook.id -
									1}`]: availableBook
							}
						}
					);

				if (!stockUpdated.ok) {
					result.ok = 0;
					throw new Error('Unbale to update stock');
				}

				result.data = data.issue_id;
			}
		} catch (error) {
			console.log(error, 'api: issue_record <database error>');
		} finally {
			client && client.close();
		}

		return result;
	}

	async return(data) {
		let result = {
			ok: 0
		};

		try {
			// extract info
			let issueId = data.issue_id; //'25B1-3115001S2'

			let book_id = issueId.substring(0, issueId.indexOf('B')),
				student_id = issueId.substring(
					issueId.indexOf('-') + 1,
					issueId.indexOf('S')
				),
				book_no = issueId.substring(issueId.indexOf('S') + 1);

			// perform checks
			let status = await this.performChecksBeforeIssue(
				{
					book_id,
					student_id,
					inst_id: data.inst_id
				},
				false
			);

			if (status.fail && !status.data.length) {
				result.msg = status.msg;
				return result;
			}

			// only fetch the book detail from second index of resp data
			let [, { book: bookFound }] = status.data;

			// find the book serial no
			let records = bookFound[0].record,
				availableBook = false,
				bookIndex;

			for (const index in records) {
				let book = records[index];

				// match the sn of book and issue no also match with student
				if (book.id === +book_no && book.isIssued === issueId) {
					availableBook = book;
					availableBook.isIssued = false;
					bookIndex = index;
					break;
				}
			}

			if (!availableBook) {
				result.msg = 'BOOK SN DOES NOT MATCH';
				return result;
			}

			var client = await this.mongo();

			let updateBookRecord = await client.db
				.collection('books')
				.findOneAndUpdate(
					{ uid: +book_id },
					{
						$inc: { stock: 1 },
						$set: {
							[`record.${bookIndex}`]: availableBook
						}
					}
				);

			if (!updateBookRecord.ok) {
				result.ok = 0;
				throw new Error(
					'Unbale to update book issue status to false on return'
				);
			}

			// delete it from issue record after all checks and updation of book record is done
			let { result: deleteDetails } = await client.db
				.collection('issue_record')
				.deleteOne({ issue_id: data.issue_id });

			result.ok = deleteDetails.ok;
		} catch (error) {
			console.log(error, 'book return error');
		} finally {
			client && client.close;
		}

		return result;
	}

	async getFine(term, data = { type: 'uid', inst_id: -1 }) {
		let collection = data.type.match(/(book|branch|all)/)
				? 'books'
				: 'students',
			// inst_id , book_id/book_name/branch/student_id , type
			detail = {
				inst_id: data.inst_id,
				[data.type]: term,
				type: data.type,
				all: data.type === 'all'
			};

		return this.getIssueRecord(detail, collection);
	}

	async edit(book, data) {
		let result = {
			ok: 0,
			msg: 'NOT ABLE TO MODIFY'
		};

		// clone the original book
		let editBook = { ...book },
			// fields that can be edited
			fields = ['name', 'author', 'branch', 'quantity'];

		// checks the fields to edit
		for (let key of fields) {
			if (key in data) {
				if (key === 'quantity') {
					// skip the iteration if qty is less than 0 or in negative
					if (+data[key] <= 0) {
						result.msg = 'BOOK QTY CANNOT BE UPDATED';
						return result;
					}

					let response = quantityManager(editBook, +data[key]);
					if (response.fail) {
						result.msg = 'BOOK QTY CANNOT BE UPDATED';
						return result;
					}

					// update record, blank_slots and stock
					editBook['record'] = response.curRecord;
					editBook['blank_slots'] = response.blankSlots;
					editBook['stock'] = response.updatedStock;

					// update qty
					editBook[key] = +data[key];
				} else {
					editBook[key] = data[key];
				}
			}
		}

		try {
			var client = await this.mongo();

			let { result: status } = await client.db
				.collection('books')
				.updateOne({ uid: book.uid }, { $set: editBook });

			result = status;
			result.data = editBook;
		} catch (error) {
			console.log(error, 'book edit cannot be done error');
		} finally {
			client && client.close();
		}

		return result;
	}

	async remove(book) {
		let result = {
			ok: 0
		};

		try {
			// check to see if there is any book issued to any student
			let { data: issueResponse } = await this.getIssueRecord({
				type: 'book_id',
				book_id: book.uid,
				inst_id: book.inst_id
			});

			// console.log(issueResponse);

			// if books are issued then not perform delation if student
			if (issueResponse.length) {
				result.msg = 'UNABLE TO DELETE.AS BOOK IS ISSUED TO STUDENT';
				return result;
			}

			var client = await this.mongo();

			let { result: deleteDetails } = await client.db
				.collection('books')
				.deleteOne({ uid: book.uid });

			result.ok = deleteDetails.ok;
		} catch (error) {
		} finally {
			client && client.close();
		}

		return result;
	}
	async modify(mode, data) {
		let result = {
			ok: 0
		};

		try {
			// check book exists
			let bookFound = await this.search(
				data.book_id,
				{ type: 'uid', inst_id: data.inst_id },
				'books'
			);

			if (!bookFound.length) {
				result.msg = 'BOOK NOT FOUND';
				return result;
			}

			let operation =
				mode === 'edit'
					? this.edit(bookFound[0], data)
					: this.remove(bookFound[0]);

			let response = await operation;

			result = response;
		} catch (error) {
			console.log(error, `api error: for <${mode}> the book`);
		}

		return result;
	}
}

module.exports = () => new Book();
