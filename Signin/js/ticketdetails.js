// @ts-nocheck
/* eslint-disable no-undef */
if(typeof window !== 'undefined' && typeof document !== 'undefined') {
	fetch(window.location.origin + '/ticket', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			_id: window.location.href.split('/').pop() || window.href.split('/').pop().pop()
		})
	}).then(response => response.json()).then(response => {
		const ticket = response[0];

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
				
				const updated = new Date(ticket.updated);

				// Adjust profile picture and name
				document.getElementById('tick-id').innerHTML = 'ID#' + ticket._id || '';
				document.getElementById('tick-date').innerHTML = 'Created: ' + new Date(ticket.date).toLocaleDateString('en-US') || '';
				document.getElementById('tick-updated').innerHTML = 'Last Updated: ' + updated.toLocaleString('en-US') || '';
				document.getElementById('tick-dep').innerHTML = values[0][0].name || ticket.department_id || '';
				document.getElementById('tick-status').innerHTML = ticket.state || '';
				document.getElementById('tick-priority').innerHTML = ticket.priority || '';
				document.getElementById('tick-subject').innerHTML = ticket.title || '';
				document.getElementById('tick-desc').innerHTML = ticket.desc || '';
				
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
		
	});
}