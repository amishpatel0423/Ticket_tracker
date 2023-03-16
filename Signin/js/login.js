/* eslint-disable no-undef */
// @ts-nocheck
function login() {
	const email = document.getElementById('email').value;
	const upass = document.getElementById('upass').value;

	// Fetch all tickets
	fetch(window.location.origin + '/login', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			email: email,
			upass: upass
		})
	}).then(response => {
		// Handle errors
		if(!response.ok) {
			(response.text()).then(response => {
				document.getElementById('error-box').style.visibility = 'visible';
				document.getElementById('error').innerHTML = response;
			});
		}
		// Redirect logged in user
		else if (response.status === 200) {
			window.location.href = 'dashboard';
		}
	});
}