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
		document.getElementById('prof-name').setAttribute('name', response[0]._id);
		
		// Adjust user department
		if(response[0].department_id) {
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
		}
		
		// Allow managers to change user department
		fetch(window.location.origin + '/isManager', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
		}).then(r => r.json()).then(r => {
			console.log(r);
			if(r.isManager) isManager(response[0].department_id);
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

function isManager(dep_id) {
	// Fetch all departmenets
	fetch(window.location.origin + '/department', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}
	}).then(response => response.json())
		.then(response => {
			// Add department options to select
			let select = document.getElementById('department-select');
			for (const dep of response) {
				let option = new Option(dep.name, dep._id);
				// @ts-ignore
				select.add(option,undefined);
			}

			// Add 'None' option
			let option = new Option('Unassigned', '');
			// @ts-ignore
			select.add(option,undefined);
		
			// Set default value to user's current department
			select.value = dep_id || '';

			// Adjust visibility
			document.getElementById('prof-dep-select').style.display = 'block';
			document.getElementById('prof-dep').style.display = 'none';
		});
}

function updateDepartment(sel) {
	// Update departmenet
	fetch(window.location.origin + '/profile/department', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			_id: document.getElementById('prof-name').getAttribute('name'),
			department_id: sel.value
		})
	}).then(response => {
		// Error if error
		if(!response.ok) {
			(response.text()).then(response => {
				document.getElementById('error-box').style.visibility = 'visible';
				document.getElementById('error').innerHTML = response;
			});
		}
	});
}