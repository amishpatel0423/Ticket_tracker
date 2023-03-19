function updatestatus(sel){

	var selection = sel.value;

	fetch(window.location.origin + '/ticket/status', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			state: selection,
			_id: new URLSearchParams(window.location.search).get('id') 
		})
	}).then(response => response.json()).then(response => {
		console.log(response);
	});}

