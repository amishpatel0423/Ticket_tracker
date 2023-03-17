// @ts-nocheck
/* eslint-disable no-undef */
if(typeof window !== 'undefined' && typeof document !== 'undefined') {
	// Populate window
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
		document.getElementById('prof-pfp').src = response[0].avatar || '/images/default.png';
		document.getElementById('prof-name').innerHTML = response[0].name;
		
		// Adjust user department
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
						clone.querySelectorAll('[name="tick-link"]').forEach(el => el.href = '/ticket/' + ticket._id);
						clone.getElementById('tick-num').innerHTML = parseInt(i) + 1;
						clone.getElementById('tick-dep').innerHTML = values[0][0].name || ticket.department_id || '';
						clone.getElementById('tick-subject').innerHTML = ticket.title || '';
						clone.getElementById('tick-id').innerHTML = ticket._id || '';
						clone.getElementById('tick-date').innerHTML = new Date(ticket.date).toLocaleDateString('en-US') || '';
						clone.getElementById('tick-priority').innerHTML = ticket.priority || '';
						
						if(values[1][0]) {
							if(values[1][0]._id === ticket.assignee_id) {
								clone.getElementById('tick-assignee').innerHTML = values[1][0].name || ticket.assignee_id || '';
								clone.querySelector('[name="prof-link2"]').href = `/profile/${values[1][0].email}`;
								clone.getElementById('tick-creator').innerHTML = values[1][1] ? values[1][1].name : ticket.creator_id ||  '';
								clone.getElementById('tick-img').src = values[1][1] ? (values[1][1].avatar  || '/images/default.png') :  '';
								clone.querySelector('[name="prof-link"]').href = values[1][1] ? `/profile/${values[1][1].email}` : '';
							}
							else {
								clone.getElementById('tick-creator').innerHTML = values[1][0].name || ticket.creator_id || '';
								clone.querySelector('[name="prof-link"]').href = `/profile/${values[1][0].email}`;
								clone.getElementById('tick-img').src = values[1][0].avatar || '/images/default.png';
								clone.getElementById('tick-assignee').innerHTML = values[1][1] ? values[1][1].name : ticket.assignee_id ||  '';
								clone.querySelector('[name="prof-link2"]').href = values[1][1] ? `/profile/${values[1][1].email}` : '';
							}
						}

						// Append newly created row
						child.replaceWith(clone);
					});
			}
		});
	});
}

function uploadImage() {
	var file = document.querySelector('input[type=file]').files[0];
	
	var reader = new FileReader();
	reader.onloadend = function () {
		// Check if image too large
		if((new TextEncoder().encode(reader.result)).length >= 20000) {
			document.getElementById('error-box').style.visibility = 'visible';
			document.getElementById('error').innerHTML = 'File too large';
			console.error('File too large!');
		}
		// Send upload request
		else {
			fetch(window.location.origin + '/profile/image', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					img: reader.result
				})
			}).then(response => {
				// Handle errors
				if(!response.ok) {
					(response.text()).then(response => {
						document.getElementById('error-box').style.visibility = 'visible';
						document.getElementById('error').innerHTML = response;
					});
				}
				// Refresh the page
				else if (response.status === 200) {
					window.location.reload();
				}
			});
		}
	};
	reader.readAsDataURL(file);
}