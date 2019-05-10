function sortAndFindGaps(curRecord) {
	// only unique index to store
	let gaps = new Set();

	// sort and gap find
	for (let i = 0; i < curRecord.length - 1; i++) {
		for (let j = 0; j < curRecord.length - 1; j++) {
			let cur = curRecord[j].id,
				next = curRecord[j + 1].id,
				distance = Math.abs(cur - next);

			if (distance > 1) {
				gaps.add(j); // index of the gap occurance
			}

			if (cur > next) {
				let temp = curRecord[j];
				curRecord[j] = next;
				curRecord[j + 1] = temp;
			}
		}
	}

	// convert the set into map and leaving first index
	gaps = [...gaps].splice(1);

	return gaps;
}

// will mutate the newIds array given by caller function
function genNewIds(iterationCount, curRecord) {
	// 3, [1,2,3] [4,5] [6,7,8]
	// 3, [1,2,3] [4,8] [5,6,7]

	// smart sorting to sort and find the gaps
	let gaps = sortAndFindGaps(curRecord),
		newIds = [];

	// if we found some gaps
	if (gaps.length) {
		// iterate over gaps to generate the id between them
		gaps.forEach(gapLoc => {
			let min = curRecord[gapLoc].id, // get first id from gap
				max = curRecord[gapLoc + 1].id, // second id from gap
				distance = max - min; // calculate distance

			// if distance is higher then 1 and iterations are required
			while (distance > 1 && iterationCount > 0) {
				min += 1; // gen new id

				newIds.push(min);

				distance -= 1; // decrement the distance approching 1
				iterationCount -= 1; // decrement the iteration
			}
		});
	}

	// if there are no gaps or iterations are still pending
	// then also generate new ids
	// take the reference from last id
	// ex: [1,2,3,4,5] then newId = 5
	let newId = curRecord[curRecord.length - 1].id + 1;

	while (iterationCount--) {
		newIds.push(newId);
		newId += 1;
	}

	return newIds;
}

function quantityManager(book, newQtyValue) {
	let curQty = book.quantity,
		curRecord = [...book.record],
		totalIssued = 0,
		// blank slots can be used to allocate id's so that no `new id` is need to generate
		blankSlots = 'blank_slots' in book ? book['blank_slots'] : [],
		result = {
			blankSlots,
			curRecord,
			fail: false
		};

	// calc total issued books
	curRecord.forEach(b => {
		if (b.isIssued) {
			totalIssued += 1;
		}
	});

	// decide the operation either increment or decrement in qty
	let operation = newQtyValue > curQty ? 'inc' : 'dec',
		iterationCount = 0;

	switch (operation) {
		case 'inc':
			iterationCount = newQtyValue - curQty;

			// try to obtain new ids from blank slots
			// and push the record with `id and isIssued` into curRecord
			while (blankSlots.length) {
				let id = blankSlots.shift();
				curRecord.push({
					id,
					isIssued: false
				});
				iterationCount -= 1;
			}

			// create new ids if no blank slots are present or still
			// there are new ids to generate or even `blank slots` are fully utilized
			if (iterationCount) {
				let newIds = genNewIds(iterationCount, curRecord); // no. of ids to generate, array of current record
				newIds.forEach(id => {
					curRecord.push({
						id,
						isIssued: false
					});
				});
			}
			break;

		case 'dec':
			let freeSlotsLocs = [];
			iterationCount = curQty - newQtyValue;

			// check if decrement is possible or not
			// examples: 2 <= 3 && 3 === 3, 3 <= 3 && 3 === 3, 4 <= 3 && 3 === 7
			if (newQtyValue <= totalIssued && totalIssued === curQty) {
				result.fail = true;
				return result;
			}

			// create blank slots a.k.a those are not issued
			for (let i = curRecord.length - 1; i >= 0; i--) {
				let b = curRecord[i];

				if (!b.isIssued) {
					freeSlotsLocs.push(b.id);
					iterationCount -= 1;
				}

				if (iterationCount === 0) {
					break;
				}
			}
			// mutate original array
			freeSlotsLocs.forEach(id => {
				let loc = result.curRecord.findIndex(book => book.id === id);
				result.curRecord.splice(loc, 1);
			});

			// update blank slots
			result.blankSlots.push(...freeSlotsLocs);

			break;
	}

	// update the stock
	result.updatedStock = newQtyValue - totalIssued;

	// will return { blankSlots, curRecord}
	// blankSlots are required to identify future qty managment
	return result;
}

module.exports = quantityManager;
