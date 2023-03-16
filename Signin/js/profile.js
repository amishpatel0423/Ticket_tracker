// @ts-nocheck
/* eslint-disable no-undef */
if(typeof window !== 'undefined' && typeof document !== 'undefined') {
	fetch(window.location.origin + '/profile', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			email: window.location.href.split('/').pop() || window.href.split('/').pop().pop()
		})
	}).then(response => response.json()).then(response => {
		// Adjust profile picture and name
		document.getElementById('prof-pfp');
		document.getElementById('prof-name').innerHTML = response[0].name;
		
		fetch(window.location.origin + '/department', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				_id: response[0].department_id
			})
		}).then(response => response.json()).then(response => {
			document.getElementById('prof-dep').innerHTML = response[0].name;
		});
		// Fetch all assigned to and created by user
		fetch(window.location.origin + '/user-tickets', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				_id: response[0]._id
			})
		}).then(response => response.json()).then(response => {

			// Get table row template
			var template = document.getElementById('ticketrow');
			var select = document.getElementById('table-row-start');
			
			// For each ticket
			for (const i in response) {
				const ticket = response[i];

				let child = document.createElement('div');
				child.id = `tr-${i}`;
				select.appendChild(child);

				// Get department by dep id
				const dep_p = fetch(window.location.origin + '/department', {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						_id: ticket.department_id
					})
				});
				// Get name by user id
				const user_p = fetch(window.location.origin + '/profile', {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						_id: [ticket.assignee_id, ticket.creator_id]
					})
				});

				// Wait for DB fetch to finish
				Promise.all([dep_p, user_p])
					.then(values => Promise.all(values.map(r => r.json())))
					.then(values => {
						// Clone template and insert data
						const clone = template.content.cloneNode(true);
						clone.getElementById('tick-num').innerHTML = parseInt(i) + 1;
						clone.getElementById('tick-img');
						clone.getElementById('tick-dep').innerHTML = values[0][0].name || ticket.department_id || '';
						clone.getElementById('tick-subject').innerHTML = ticket.title || '';
						clone.getElementById('tick-id').innerHTML = ticket._id || '';
						clone.getElementById('tick-date').innerHTML = new Date(ticket.date).toLocaleDateString('en-US') || '';
						clone.getElementById('tick-priority').innerHTML = ticket.priority || '';
						
						if(values[1][0]) {
							if(values[1][0]._id === ticket.assignee_id) {
								clone.getElementById('tick-assignee').innerHTML = values[1][0].name || ticket.assignee_id || '';
								clone.getElementById('tick-creator').innerHTML = values[1][1] ? values[1][1].name : ticket.creator_id ||  '';
							}
							else {
								clone.getElementById('tick-creator').innerHTML = values[1][0].name || ticket.creator_id || '';
								clone.getElementById('tick-assignee').innerHTML = values[1][1] ? values[1][1].name : ticket.assignee_id ||  '';
							}
						}

						// Append newly created row
						child.replaceWith(clone);
					});
			}
		});
	});
}