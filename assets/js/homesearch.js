import view from './common/render.js';

$('#searchInput').on('keyup', event => {
	if (event.key != 'Enter') {
		return;
	}

	let val = event.target.value.trim(),
		msgBox = $('#srchMsg');

	if (!val.length) {
		msgBox.html(`<p class='text-danger'>Fields must not be blank</p>`);
		return;
	}

	performSearch(val, msgBox);
});

async function performSearch(val, msgBox) {
	let body = new FormData();
	body.append('student_id', val);

	let res = await fetch('/issuerecord', {
		method: 'POST',
		body: new URLSearchParams([...body])
	});

	if (res.status === 200) {
		let result = await res.json();

		if (!result.length) {
			$('#detailBox').html('');
			$('#recTable tbody').html('');
			alert('No issue record found');
			return;
		}

		displayResult(result);
	}
}

function displayResult(record) {
	let student = record[0];

	let html = `<p><strong>Name:</strong> ${student.name} </p>
                <p><strong>Institue Name:</strong> ${student.inst_name} </p>
                <p><strong>Branch:</strong> ${student.branch} </p>
                <p><strong>Roll No:</strong> ${student.rollno} </p>
                <p><strong>Total Fine:</strong> ${student.totalFine} </p>`;

	$('#detailBox').html(html);

	view.renderTable(record, 'noBtn', 'homeSearchTable');
}
