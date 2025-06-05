document.addEventListener('DOMContentLoaded', function() {
    const userId = localStorage.getItem('userId');
    const contactTableBody = document.querySelector('.crud-table tbody');
    const addContactButton = document.getElementById('add_contact_button');
    const contactMessage = document.getElementById('contact_message');

    const newFirstNameInput = document.getElementById('new_firstName');
    const newLastNameInput = document.getElementById('new_lastName');
    const newPhoneInput = document.getElementById('new_phone');
    const newEmailInput = document.getElementById('new_email');
    const searchContactsInput = document.getElementById('search_contacts_input');

    const searchContactsUrl = 'http://cop4331-summer25-g19.org/LAMPAPI/SearchContacts.php';
    const addContactUrl = 'http://cop4331-summer25-g19.org/LAMPAPI/AddContact.php';
    const deleteContactUrl = 'http://cop4331-summer25-g19.org/LAMPAPI/DeleteContact.php';
    const modifyContactUrl = 'http://cop4331-summer25-g19.org/LAMPAPI/ModifyContact.php';

    let editingContactRowElement = null;
    let originalContactData = null;

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
                    editIcon.addEventListener('click', () => handleEdit(contact, row));
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

    function validateEditInputs(inputs) {
        const firstName = inputs.firstNameInput.value.trim();
        const lastName = inputs.lastNameInput.value.trim();
        const phoneInput = inputs.phoneInput.value;
        const email = inputs.emailInput.value.trim();
        const unformattedPhone = unformatPhoneNumber(phoneInput);

        const isFirstNameValid = !!firstName;
        const isLastNameValid = !!lastName;
        const isPhoneValid = unformattedPhone.length === 10;
        const isEmailValid = isValidEmail(email);

        return isFirstNameValid && isLastNameValid && isPhoneValid && isEmailValid;
    }

    function updateEditConfirmButtonState(confirmButton, inputs) {
        if (confirmButton) {
            confirmButton.disabled = !validateEditInputs(inputs);
        }
    }

    function handleEdit(contact, rowElement) {
        if (editingContactRowElement && editingContactRowElement !== rowElement) {
            cancelCurrentEdit(); // Cancel any other ongoing edit
        }

        editingContactRowElement = rowElement;
        originalContactData = { ...contact }; // Store a copy

        rowElement.innerHTML = ''; 

        const tdFirstName = rowElement.insertCell();
        const inputFirstName = document.createElement('input');
        inputFirstName.type = 'text';
        inputFirstName.value = contact.firstName;
        tdFirstName.appendChild(inputFirstName);

        const tdLastName = rowElement.insertCell();
        const inputLastName = document.createElement('input');
        inputLastName.type = 'text';
        inputLastName.value = contact.lastName;
        tdLastName.appendChild(inputLastName);

        const tdPhone = rowElement.insertCell();
        const inputPhone = document.createElement('input');
        inputPhone.type = 'tel';
        inputPhone.value = formatPhoneNumber(contact.Phone); 
        inputPhone.addEventListener('input', function(e) { 
            const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
            e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
        });
        tdPhone.appendChild(inputPhone);

        const tdEmail = rowElement.insertCell();
        const inputEmail = document.createElement('input');
        inputEmail.type = 'email';
        inputEmail.value = contact.Email;
        tdEmail.appendChild(inputEmail);

        const tdActions = rowElement.insertCell();
        tdActions.classList.add('action-icons');

        const confirmIcon = document.createElement('span');
        confirmIcon.textContent = '✓'; // Check mark
        confirmIcon.title = 'Confirm Edit';
        confirmIcon.style.cursor = 'pointer';
        confirmIcon.addEventListener('click', () => handleConfirmUpdate());
        tdActions.appendChild(confirmIcon);

        const cancelIcon = document.createElement('span');
        cancelIcon.textContent = '✗'; // X mark
        cancelIcon.title = 'Cancel Edit';
        cancelIcon.style.cursor = 'pointer';
        cancelIcon.addEventListener('click', () => cancelCurrentEdit());
        tdActions.appendChild(cancelIcon);
        
        const inputs = { firstNameInput: inputFirstName, lastNameInput: inputLastName, phoneInput: inputPhone, emailInput: inputEmail };
        
        // Add event listeners to new inputs for live validation
        Object.values(inputs).forEach(input => {
            input.addEventListener('input', () => updateEditConfirmButtonState(confirmIcon, inputs));
        });
        
        // Initial validation for the confirm button state
        updateEditConfirmButtonState(confirmIcon, inputs);
    }

    function cancelCurrentEdit() {
        if (editingContactRowElement && originalContactData) {
            editingContactRowElement.innerHTML = ''; 

            editingContactRowElement.insertCell().textContent = originalContactData.firstName;
            editingContactRowElement.insertCell().textContent = originalContactData.lastName;
            editingContactRowElement.insertCell().textContent = formatPhoneNumber(originalContactData.Phone);
            editingContactRowElement.insertCell().textContent = originalContactData.Email;

            const actionsCell = editingContactRowElement.insertCell();
            actionsCell.classList.add('action-icons');

            const editIcon = document.createElement('span');
            editIcon.textContent = '✎';
            editIcon.title = 'Edit Contact';
            editIcon.addEventListener('click', () => handleEdit(originalContactData, editingContactRowElement));
            actionsCell.appendChild(editIcon);

            const deleteIcon = document.createElement('span');
            deleteIcon.textContent = '🗑️';
            deleteIcon.title = 'Delete Contact';
            deleteIcon.addEventListener('click', () => handleDelete(originalContactData));
            actionsCell.appendChild(deleteIcon);
        }
        editingContactRowElement = null;
        originalContactData = null;
    }

    async function handleConfirmUpdate() {
        if (!editingContactRowElement || !originalContactData) return;

        const inputs = {
            firstNameInput: editingContactRowElement.cells[0].querySelector('input'),
            lastNameInput: editingContactRowElement.cells[1].querySelector('input'),
            phoneInput: editingContactRowElement.cells[2].querySelector('input'),
            emailInput: editingContactRowElement.cells[3].querySelector('input')
        };

        if (!validateEditInputs(inputs)) {
            showMessage('Invalid input. Please check all fields.', true);
            return;
        }

        const firstName = inputs.firstNameInput.value.trim();
        const lastName = inputs.lastNameInput.value.trim();
        const phone = unformatPhoneNumber(inputs.phoneInput.value);
        const email = inputs.emailInput.value.trim();

        const payload = {
            contactId: originalContactData.id, 
            userId: userId,
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            email: email
        };

        try {
            const response = await fetch(modifyContactUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (data.error === "") {
                showMessage('Contact updated successfully!');
                cancelCurrentEdit(); 
                loadContacts(); 
            } else {
                showMessage('Error updating contact: ' + data.error, true);
            }
        } catch (error) {
            showMessage('Failed to update contact: ' + error, true);
            console.error('Error updating contact:', error);
        }
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

    // Event listener for the search input
    if (searchContactsInput) {
        searchContactsInput.addEventListener('input', function() {
            const searchTerm = searchContactsInput.value.trim();
            if (searchTerm.length >= 2) {
                loadContacts(searchTerm);
            } else if (searchTerm.length === 0) { // Also reload all if search is cleared
                loadContacts('');
            }
            // If less than 2 chars but not empty, do nothing, wait for more input
        });
    }

    loadContacts();
    updateAddButtonState(); 
}); 