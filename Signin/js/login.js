/* eslint-disable no-undef */
// @ts-nocheck
function login() {
	const email = document.getElementById('email').value;
	const upass = document.getElementById('upass').value;
	console.log(email, upass);
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
		if(response.status === 401) {
			document.getElementById('error').style.visibility = 'visible';
		}
		else if (response.status === 200) {
			window.location.href = 'dashboard';
		}
	});
}