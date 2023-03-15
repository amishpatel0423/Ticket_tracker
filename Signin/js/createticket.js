/* eslint-disable no-undef */
if(typeof window !== 'undefined' && typeof document !== 'undefined') {
	fetch(window.location.origin + '/department', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}
	}).then(response => response.json())
		.then(response => {
			var select = document.getElementById('department-select');
			for (const dep of response) {
				let option = new Option(dep.name, dep._id);
				// @ts-ignore
				select.add(option,undefined);
			}
		});
}