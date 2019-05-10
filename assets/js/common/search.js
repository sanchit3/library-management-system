export default class Search {
	constructor(context) {
		this.context = context;
	}

	registerForSearch(
		callback,
		eventName = 'click',
		performRecordSearch = false
	) {
		let elem =
			eventName === 'click' ? $('.search-btn') : $('.search-input');

		elem.on(eventName, event => {
			let term =
					eventName === 'keyup'
						? event.target.value
						: $('.search-input').val(),
				msgBox = $('.search-input + div'),
				srchType = $('#searchType').val(),
				btn = event.target;

			if (eventName === 'keyup' && event.key !== 'Enter') {
				return;
			}

			if (btn.id === 'searchAll') {
				srchType = '';
				term = '';
			} else if (!term.trim().length) {
				msgBox.html(
					'<p class="text-danger">Please provide search term</p>'
				);
				return;
			}

			if (performRecordSearch) {
				callback.call(
					this.context,
					term,
					srchType,
					msgBox,
					event.target
				);
			} else {
				this.search(term, srchType, msgBox, callback);
			}
		});
	}

	async search(term, type, msgBox, callback) {
		let payload = {
				term,
				type
			},
			msg = '';

		let res = await this.context.http
			.post('/search', payload)
			.then(data => data.json());

		if (!res.length) {
			msg = `<p class="text-danger">${
				this.context.displayName
			} not found</p>`;
		} else {
			msg = `<p class="text-success">${
				this.context.displayName
			}(s) found</p>`;
		}

		msgBox.html(msg);

		callback(res);
	}
}
