// @ts-nocheck
/* eslint-disable no-undef */
if(typeof window !== 'undefined' && typeof document !== 'undefined') {
	// Get current ticket
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
						document.getElementById('tick-assignee').innerHTML = values[1][0].name || ticket.assignee_id || '';
						document.getElementById('tick-creator').innerHTML = values[1][1] ? values[1][1].name : ticket.creator_id ||  '';
					}
					else {
						document.getElementById('tick-creator').innerHTML = values[1][0].name || ticket.creator_id || '';
						document.getElementById('tick-assignee').innerHTML = values[1][1] ? values[1][1].name : ticket.assignee_id ||  '';
					}
				}
			});
		
	});
	
	// Get current comments
	fetch(window.location.origin + '/comment', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			ticket_id: window.location.href.split('/').pop() || window.href.split('/').pop().pop()
		})
	}).then(response => response.json()).then(response => {
		
		// Get table row template
		var template = document.getElementById('commentitem');
		var select = document.getElementById('comment-list');

		// For each comment
		for (const i in response) {
			const comment = response[i];

			let child = document.createElement('div');
			child.id = `tr-${i}`;
			select.appendChild(child);
		
			// Get name from user id
			fetch(window.location.origin + '/profile', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					_id: comment.user_id
				})
			}).then(values => values.json()).then(values =>{
				//Clone template and insert data
				const clone = template.content.cloneNode(true);
				clone.getElementById('comm-name').innerHTML = values[0].name;
				clone.getElementById('comm-text').innerHTML = comment.text;

				// Apply new row
				child.replaceWith(clone);
			});
		}
	});
}