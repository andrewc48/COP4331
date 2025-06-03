document.getElementById("login_button").addEventListener("click", function () {
	const username = document.getElementById("username_input").value;
	const password = document.getElementById("password_input").value;
	const loginMessage = document.getElementById("login_message");

	const payload = {
		login: username,
		password: password
	};

	fetch("http://cop4331-summer25-g19.org/LAMPAPI/Login.php", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(payload)
	})
	.then(response => response.json())
	.then(data => {
		if (data.error === "") {
			localStorage.setItem("userId", data.id);
			localStorage.setItem("firstName", data.firstName);
			localStorage.setItem("lastName", data.lastName);
			localStorage.setItem("username", username);
			window.location.href = "home.html";
		} else {
			loginMessage.textContent = "Login failed: " + data.error;
			console.log("Login failed:", data.error);
		}
	})
	.catch(error => {
		loginMessage.textContent = "Error during login. Please try again.";
		console.error("Error:", error);
	});
});