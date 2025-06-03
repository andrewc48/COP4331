document.addEventListener('DOMContentLoaded', function() {
    const userId = localStorage.getItem('userId');
    const contactTableBody = document.querySelector('.crud-table tbody');
    const addContactButton = document.getElementById('add_contact_button');
    const contactMessage = document.getElementById('contact_message');

    const newFirstNameInput = document.getElementById('new_firstName');
    const newLastNameInput = document.getElementById('new_lastName');
    const newPhoneInput = document.getElementById('new_phone');
    const newEmailInput = document.getElementById('new_email');

    const searchContactsUrl = 'http://cop4331-summer25-g19.org/LAMPAPI/SearchContacts.php';
    const addContactUrl = 'http://cop4331-summer25-g19.org/LAMPAPI/AddContact.php';
    const deleteContactUrl = 'http://cop4331-summer25-g19.org/LAMPAPI/DeleteContact.php';

    function formatPhoneNumber(phoneNumberString) {
        const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
        return phoneNumberString; // Return original if not a 10-digit number
    }

    function unformatPhoneNumber(formattedPhoneNumber) {
        return ('' + formattedPhoneNumber).replace(/\D/g, '');
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function validateAddContactForm() {
        const firstName = newFirstNameInput.value.trim();
        const lastName = newLastNameInput.value.trim();
        const phoneInput = newPhoneInput.value;
        const email = newEmailInput.value.trim();

        const unformattedPhone = unformatPhoneNumber(phoneInput);

        const isFirstNameValid = !!firstName;
        const isLastNameValid = !!lastName;
        const isPhoneValid = unformattedPhone.length === 10;
        const isEmailValid = isValidEmail(email);

        return isFirstNameValid && isLastNameValid && isPhoneValid && isEmailValid;
    }

    function updateAddButtonState() {
        if (addContactButton) {
            addContactButton.disabled = !validateAddContactForm();
        }
    }

    function showMessage(message, isError = false) {
        contactMessage.textContent = message;
        contactMessage.style.color = isError ? 'red' : 'green';
    }

    async function loadContacts(searchTerm = '') {
        if (!userId) {
            showMessage('User ID not found. Please log in again.', true);
            return;
        }

        const payload = {
            userId: userId,
            search: searchTerm
        };

        try {
            const response = await fetch(searchContactsUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            while (contactTableBody.children.length > 1) {
                contactTableBody.removeChild(contactTableBody.lastChild);
            }

            if (data.error && data.error !== "") {
                if (data.error === "No Records Found") {
                    showMessage('No contacts found.');
                } else {
                    showMessage('Error loading contacts: ' + data.error, true);
                }
            } else if (data.results && data.results.length > 0) {
                data.results.forEach(contact => {
                    const row = contactTableBody.insertRow();
                    row.insertCell().textContent = contact.firstName;
                    row.insertCell().textContent = contact.lastName;
                    row.insertCell().textContent = formatPhoneNumber(contact.Phone); 
                    row.insertCell().textContent = contact.Email;
                    
                    const actionsCell = row.insertCell();
                    actionsCell.classList.add('action-icons');
                    
                    const editIcon = document.createElement('span');
                    editIcon.textContent = '✎'; 
                    editIcon.title = 'Edit Contact';
                    editIcon.addEventListener('click', () => handleEdit(contact));
                    actionsCell.appendChild(editIcon);

                    const deleteIcon = document.createElement('span');
                    deleteIcon.textContent = '🗑️'; 
                    deleteIcon.title = 'Delete Contact';
                    deleteIcon.addEventListener('click', () => handleDelete(contact));
                    actionsCell.appendChild(deleteIcon);
                });
                showMessage('Contacts loaded.');
            } else {
                showMessage('No contacts found.');
            }
        } catch (error) {
            showMessage('Failed to fetch contacts: ' + error, true);
            console.error('Error loading contacts:', error);
        }
    }

    async function addContactHandler() {
        if (!validateAddContactForm()) {
            showMessage('Please ensure all fields are filled correctly.', true);
            if (!newFirstNameInput.value.trim()) {
                showMessage('First name is required.', true);
                newFirstNameInput.focus(); return;
            }
            if (!newLastNameInput.value.trim()) {
                showMessage('Last name is required.', true);
                newLastNameInput.focus(); return;
            }
            if (unformatPhoneNumber(newPhoneInput.value).length !== 10) {
                showMessage('Please enter a valid 10-digit phone number.', true);
                newPhoneInput.focus(); return;
            }
            if (!isValidEmail(newEmailInput.value.trim())) {
                showMessage('Please enter a valid email address.', true);
                newEmailInput.focus(); return;
            }
            return; 
        }

        const firstName = newFirstNameInput.value.trim();
        const lastName = newLastNameInput.value.trim();
        const phoneInput = newPhoneInput.value; 
        const email = newEmailInput.value.trim();
        const unformattedPhone = unformatPhoneNumber(phoneInput);

        const payload = {
            userId: userId,
            firstName: firstName,
            lastName: lastName,
            phone: unformattedPhone, 
            email: email
        };

        try {
            const response = await fetch(addContactUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.error === "") {
                showMessage('Contact added successfully!');
                newFirstNameInput.value = '';
                newLastNameInput.value = '';
                newPhoneInput.value = '';
                newEmailInput.value = '';
                loadContacts(); 
            } else {
                showMessage('Error adding contact: ' + data.error, true);
            }
        } catch (error) {
            showMessage('Failed to add contact: ' + error, true);
            console.error('Error adding contact:', error);
        }
    }

    async function handleDelete(contact) {
        if (!confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`)) {
            return;
        }

        const payload = {
            userId: userId,
            firstName: contact.firstName,
            lastName: contact.lastName,
            phone: contact.Phone, 
            email: contact.Email  
        };

        try {
            const response = await fetch(deleteContactUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.error === "") {
                showMessage('Contact deleted successfully!');
                loadContacts(); 
            } else {
                showMessage('Error deleting contact: ' + data.error, true);
            }
        } catch (error) {
            showMessage('Failed to delete contact: ' + error, true);
            console.error('Error deleting contact:', error);
        }
    }

    function handleEdit(contact) {
        console.log('Edit contact:', contact);
        showMessage(`Editing ${contact.firstName} ${contact.lastName} - (Edit functionality not yet implemented).`, false);
    }

    if (addContactButton) {
        addContactButton.addEventListener('click', addContactHandler);
    }

    [newFirstNameInput, newLastNameInput, newPhoneInput, newEmailInput].forEach(input => {
        if (input) {
            input.addEventListener('input', updateAddButtonState);
        }
    });

    if (newPhoneInput) {
        newPhoneInput.addEventListener('input', function(e) {
            const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
    }

    loadContacts();
    updateAddButtonState(); 
}); 