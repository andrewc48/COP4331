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

    // Function to display messages
    function showMessage(message, isError = false) {
        contactMessage.textContent = message;
        contactMessage.style.color = isError ? 'red' : 'green';
    }

    // Function to load/refresh contacts
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

            // Clear existing rows except the add form
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
                    const row = contactTableBody.insertRow(); // Insert new row at the end
                    row.insertCell().textContent = contact.firstName;
                    row.insertCell().textContent = contact.lastName;
                    row.insertCell().textContent = contact.Phone; // Note: PHP uses 'Phone' with capital P
                    row.insertCell().textContent = contact.Email; // Note: PHP uses 'Email' with capital E
                    
                    const actionsCell = row.insertCell();
                    actionsCell.classList.add('action-icons');
                    
                    const editIcon = document.createElement('span');
                    editIcon.textContent = '✎'; // Edit icon
                    editIcon.title = 'Edit Contact';
                    editIcon.addEventListener('click', () => handleEdit(contact));
                    actionsCell.appendChild(editIcon);

                    const deleteIcon = document.createElement('span');
                    deleteIcon.textContent = '🗑️'; // Delete icon
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

    // Function to add a new contact
    async function addContactHandler() {
        const firstName = newFirstNameInput.value.trim();
        const lastName = newLastNameInput.value.trim();
        const phone = newPhoneInput.value.trim();
        const email = newEmailInput.value.trim();

        if (!firstName || !lastName || !phone || !email) {
            showMessage('All fields are required to add a contact.', true);
            return;
        }

        const payload = {
            userId: userId,
            firstName: firstName,
            lastName: lastName,
            phone: phone,
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
                loadContacts(); // Refresh the list
            } else {
                showMessage('Error adding contact: ' + data.error, true);
            }
        } catch (error) {
            showMessage('Failed to add contact: ' + error, true);
            console.error('Error adding contact:', error);
        }
    }

    // Function to handle deleting a contact
    async function handleDelete(contact) {
        if (!confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`)) {
            return;
        }

        const payload = {
            userId: userId,
            firstName: contact.firstName,
            lastName: contact.lastName,
            phone: contact.Phone, // Make sure these keys match your API
            email: contact.Email  // Make sure these keys match your API
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
                loadContacts(); // Refresh the list
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

    // Event Listeners
    if (addContactButton) {
        addContactButton.addEventListener('click', addContactHandler);
    }

    // Initial load of contacts
    loadContacts();
}); 