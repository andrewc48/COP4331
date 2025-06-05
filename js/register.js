document.getElementById("register_button").addEventListener("click", function () {
    const username = document.getElementById("username_input").value;
    const password = document.getElementById("password_input").value;
    const firstName = document.getElementById("first_name_input").value;
    const lastName = document.getElementById("last_name_input").value;
    const registerMessage = document.getElementById("register_message");

    const payload = {
        login: username,
        password: password,
        firstName: firstName,
        lastName: lastName
    };

    fetch("http://cop4331-summer25-g19.org/LAMPAPI/Register.php", {
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
            window.location.href = "contacts.html";
        } else {
            registerMessage.textContent = "Registration failed: " + data.error;
            console.log("Register failed:", data.error);
        }
    })
    .catch(error => {
        registerMessage.textContent = "Error during registration. Please try again.";
        console.error("Error:", error);
    });
});