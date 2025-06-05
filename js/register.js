document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById("username_input");
    const passwordInput = document.getElementById("password_input");
    const firstNameInput = document.getElementById("first_name_input");
    const lastNameInput = document.getElementById("last_name_input");
    const registerButton = document.getElementById("register_button");
    const registerMessage = document.getElementById("register_message");

    const usernameReqLength = document.getElementById("username_req_length");
    const passwordReqLength = document.getElementById("password_req_length");
    const passwordReqSpecial = document.getElementById("password_req_special");
    const passwordReqCharset = document.getElementById("password_req_charset");
    const usernameReqCharset = document.getElementById("username_req_charset");

    const ALLOWED_CHARS_USERNAME_REGEX = /^[a-zA-Z0-9_-]*$/;
    const SPECIFIC_SPECIAL_CHARS_PASSWORD_REGEX = /[!@#$^&*-=+\\]/;
    const ALLOWED_CHARS_PASSWORD_REGEX = /^[a-zA-Z0-9!@#$^&*-=+\\]*$/;

    function updateRequirementIndicator(element, isValid) {
        const iconElement = element.querySelector(".icon");
        if (isValid) {
            element.classList.remove("invalid");
            element.classList.add("valid");
            iconElement.textContent = "✓";
        } else {
            element.classList.remove("valid");
            element.classList.add("invalid");
            iconElement.textContent = "✗";
        }
    }

    function validateUsername() {
        const username = usernameInput.value;
        let allUsernameReqsValid = true;

        const isLengthValid = username.length >= 6;
        updateRequirementIndicator(usernameReqLength, isLengthValid);
        if (!isLengthValid) allUsernameReqsValid = false;

        const isCharsetValid = ALLOWED_CHARS_USERNAME_REGEX.test(username);
        updateRequirementIndicator(usernameReqCharset, isCharsetValid);
        if (!isCharsetValid) allUsernameReqsValid = false;

        return allUsernameReqsValid;
    }

    function validatePassword() {
        const password = passwordInput.value;
        let allPasswordReqsValid = true;

        const isLengthValid = password.length >= 8;
        updateRequirementIndicator(passwordReqLength, isLengthValid);
        if (!isLengthValid) allPasswordReqsValid = false;

        const hasSpecialChar = SPECIFIC_SPECIAL_CHARS_PASSWORD_REGEX.test(password);
        updateRequirementIndicator(passwordReqSpecial, hasSpecialChar);
        if (!hasSpecialChar) allPasswordReqsValid = false;

        const isCharsetValid = ALLOWED_CHARS_PASSWORD_REGEX.test(password);
        updateRequirementIndicator(passwordReqCharset, isCharsetValid);
        if (!isCharsetValid) allPasswordReqsValid = false;
        
        return allPasswordReqsValid;
    }

    if (usernameInput) {
        usernameInput.addEventListener("input", validateUsername);
    }
    if (passwordInput) {
        passwordInput.addEventListener("input", validatePassword);
    }

    validateUsername();
    validatePassword();

    if (registerButton) {
        registerButton.addEventListener("click", function () {
            registerMessage.textContent = "";
            const isUsernameValid = validateUsername();
            const isPasswordValid = validatePassword();
            const firstName = firstNameInput.value.trim();
            const lastName = lastNameInput.value.trim();

            if (!firstName || !lastName) {
                registerMessage.textContent = "First name and last name are required.";
                return;
            }

            if (!isUsernameValid || !isPasswordValid) {
                registerMessage.textContent = "Please ensure all username and password requirements are met.";
                return;
            }

            const payload = {
                login: usernameInput.value,
                password: passwordInput.value,
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
                    localStorage.setItem("username", usernameInput.value);
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
    }
});