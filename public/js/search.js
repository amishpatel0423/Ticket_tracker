// @ts-nocheck
/* eslint-disable no-undef */
if(typeof window !== 'undefined' && typeof document !== 'undefined') {
	document.getElementById('results-title').innerHTML = `Results for "${(new URLSearchParams(window.location.search)).get('query')}"`;

	// Fetch all tickets
	fetch(window.location.href, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}
	}).then(response => response.json())
		.then(response => {
			
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
				const user_p = fetch(window.location.origin + '/profiles', {
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
						clone.querySelectorAll('[name="tick-link"]').forEach(el => el.href = '/ticket/' + ticket._id);
						clone.getElementById('tick-num').innerHTML = parseInt(i) + 1;
						clone.getElementById('tick-img');
						clone.getElementById('tick-dep').innerHTML = ticket.department_id ? (values[0][0].name || ticket.department_id) : '';
						clone.getElementById('tick-subject').innerHTML = ticket.title || '';
						clone.getElementById('tick-id').innerHTML = ticket._id || '';
						clone.getElementById('tick-date').innerHTML = new Date(ticket.date).toLocaleDateString('en-US') || '';
						clone.getElementById('tick-priority').innerHTML = ticket.priority || '';
						
						var creator, assignee;
						// Find creator / assignee
						if(values[1].length > 1) {
							creator = (values[1][0]._id === ticket.creator_id) ? values[1][0] : values[1][1];
							assignee = (values[1][0]._id === ticket.assignee_id) ? values[1][0] : values[1][1];
						} 
						else if(values[1].length > 0) {
							if(ticket.creator_id === ticket.assignee_id) {
								creator = values[1][0];
								assignee = values[1][0];
							}
							else if(values[1][0]._id === ticket.creator_id)
								creator = values[1][0];
							else assignee = values[1][0];
						}

						// Fill in creator/assignee values
						clone.getElementById('tick-assignee').innerHTML = assignee ? assignee.name : '';
						clone.querySelector('[name="prof-link2"]').href = assignee ? `/profile/${assignee.email}` : '';
						clone.getElementById('tick-creator').innerHTML = creator ? creator.name :  '';
						clone.getElementById('tick-img').src = creator ? (creator.avatar || '/images/default.png') : '';
						clone.querySelector('[name="prof-link"]').href = creator ? `/profile/${creator.email}` : '';
						
						// Status identifier
						clone.getElementById('ticketdiv').setAttribute('name', ticket.state);
						
						// Append newly created row
						child.replaceWith(clone);
					});
			}
		});
}

function searchStatus(sel) {
	var selection = sel.value;
	let states = ['', 'Pending', 'In Progress', 'Complete', 'Closed'];
	states.forEach(state => {
		document.getElementsByName(state).forEach(
			el => {
				el.style.display = (( !selection || el.getAttribute('name') === selection) ? 'flex' : 'none');
			}
		);
	}
	);
}
