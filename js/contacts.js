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

    let fishTankContainer;
    let activeFish = {}; // { contactId: { element, nameElement, svgElement, x, y, targetX, targetY, speed, isExiting, facingRight } }
    const FISH_DIMENSION = 50;
    const FISH_COLORS = ["gold", "orange", "lightcoral", "deepskyblue", "lightgreen", "violet", "wheat"];

    function createFishSvgElement() {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", "50");
        svg.setAttribute("height", "50");
        svg.setAttribute("viewBox", "0 0 800 800");
        svg.setAttribute("fill", "none");

        const randomColor = FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)];

        const path1 = document.createElementNS(svgNS, "path");
        path1.setAttribute("d", "M271.776 403.112C272.634 402.254 273.492 401.396 284.019 396.233C294.545 391.071 314.714 381.63 333.471 374.407C352.229 367.183 368.965 362.463 379.946 359.817C395.501 356.069 402.228 355.87 412.768 354.576C421.567 353.496 437.468 352.424 452.728 350.259C482.303 346.063 498.884 341.137 504.71 339.408C513.335 336.847 529.144 336.365 551.185 339.362C577.789 342.98 590.781 358.887 595.956 361.91C604.11 366.674 613.732 371.436 619.584 377.281C621.796 379.49 621.573 380.98 618.999 383.36C605.9 395.466 599.493 397.469 592.569 398.769C573.682 402.316 564.357 414.79 559.826 416.76C557.567 417.741 547.557 426.454 521.868 439.854C506.891 447.667 486.31 454.113 475.061 457.656C462.344 461.662 454.321 459.899 437.065 462.038C425.817 464.607 409.51 470.185 399.822 473.059C390.135 475.933 387.56 475.933 384.907 475.933");
        path1.setAttribute("stroke", randomColor);
        path1.setAttribute("stroke-width", "190");
        path1.setAttribute("stroke-linecap", "round");
        svg.appendChild(path1);

        const path2 = document.createElementNS(svgNS, "path");
        path2.setAttribute("d", "M66.6667 500C127.778 411.11 293.333 233.333 466.667 233.333C497.42 233.333 525.13 236.831 550 242.895M550 242.895C665.317 271.011 733.333 400 733.333 400C733.333 400 665.317 528.99 550 557.107M550 242.895C470 370.543 516.667 505.557 550 557.107M66.6667 300C127.778 388.89 293.333 566.667 466.667 566.667C497.42 566.667 525.13 563.17 550 557.107M400 350C383.333 366.667 360 410 400 450");
        path2.setAttribute("stroke", randomColor);
        path2.setAttribute("stroke-width", "66.6667");
        path2.setAttribute("stroke-linecap", "round");
        svg.appendChild(path2);

        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", "599.5");
        circle.setAttribute("cy", "359.5");
        circle.setAttribute("r", "47.5");
        circle.setAttribute("fill", "black");
        svg.appendChild(circle);

        return svg;
    }

    function initFishTank() {
        fishTankContainer = document.getElementById('fish-tank-container');
        if (!fishTankContainer) {
            console.warn("Fish tank container not found.");
            return;
        }
        setInterval(updateAllFishPositions, 70);
    }

    function addOrUpdateFish(contact) {
        if (!fishTankContainer || !contact.id) return;

        let fishData = activeFish[contact.id];

        if (fishData) {
            if (fishData.nameElement.textContent !== contact.firstName) {
                fishData.nameElement.textContent = contact.firstName;
            }
            if (fishData.isExiting) {
                fishData.isExiting = false;
                fishData.speed = 0.8 + Math.random() * 1.2;
                const tankWidth = fishTankContainer.clientWidth;
                const tankHeight = fishTankContainer.clientHeight;
                fishData.targetX = Math.random() * (tankWidth - FISH_DIMENSION);
                fishData.targetY = Math.random() * (tankHeight - FISH_DIMENSION);
            }
            return; 
        }

        const fishWrapper = document.createElement('div');
        fishWrapper.className = 'fish-wrapper';

        const svgElement = createFishSvgElement();
        const nameElement = document.createElement('p');
        nameElement.textContent = contact.firstName;

        fishWrapper.appendChild(svgElement);
        fishWrapper.appendChild(nameElement);
        fishTankContainer.appendChild(fishWrapper);

        const tankWidth = fishTankContainer.clientWidth;
        const tankHeight = fishTankContainer.clientHeight;

        const spawnSide = Math.floor(Math.random() * 4);
        let initialX, initialY;
        let initialFacingRight = true;

        switch (spawnSide) {
            case 0:
                initialX = -FISH_DIMENSION; 
                initialY = Math.random() * (tankHeight - FISH_DIMENSION);
                initialFacingRight = true;
                break;
            case 1:
                initialX = tankWidth + FISH_DIMENSION / 2;
                initialY = Math.random() * (tankHeight - FISH_DIMENSION);
                initialFacingRight = false;
                break;
            case 2: 
                initialX = Math.random() * (tankWidth - FISH_DIMENSION);
                initialY = -FISH_DIMENSION;
                initialFacingRight = Math.random() < 0.5;
                break;
            case 3: 
                initialX = Math.random() * (tankWidth - FISH_DIMENSION);
                initialY = tankHeight + FISH_DIMENSION / 2;
                initialFacingRight = Math.random() < 0.5;
                break;
        }

        fishData = {
            element: fishWrapper,
            nameElement: nameElement,
            svgElement: svgElement,
            x: initialX,
            y: initialY,
            targetX: Math.random() * (tankWidth - FISH_DIMENSION),
            targetY: Math.random() * (tankHeight - FISH_DIMENSION),
            speed: 0.8 + Math.random() * 1.2, 
            isExiting: false,
            facingRight: initialFacingRight
        };
        activeFish[contact.id] = fishData;
        applyFishPosition(fishData); 
    }

    function markFishForRemoval(contactId) {
        if (!fishTankContainer || !activeFish[contactId]) return;

        const fishData = activeFish[contactId];
        if (fishData.isExiting) return; // Already exiting

        fishData.isExiting = true;
        fishData.speed *= 1.5; // Increase speed by 1.5x

        const tankWidth = fishTankContainer.clientWidth;
        const tankHeight = fishTankContainer.clientHeight;

        // Current position
        const currentX = fishData.x;
        const currentY = fishData.y;

        const distToLeft = currentX + FISH_DIMENSION;
        const distToRight = tankWidth - currentX;
        const distToTop = currentY + FISH_DIMENSION;
        const distToBottom = tankHeight - currentY;

        let minDist = distToLeft;
        let exitDirection = 'left';

        if (distToRight < minDist) {
            minDist = distToRight;
            exitDirection = 'right';
        }
        if (distToTop < minDist) {
            minDist = distToTop;
            exitDirection = 'top';
        }
        if (distToBottom < minDist) {
            minDist = distToBottom;
            exitDirection = 'bottom';
        }

        switch (exitDirection) {
            case 'left':
                fishData.targetX = -FISH_DIMENSION * 2;
                fishData.targetY = currentY;
                fishData.facingRight = false;
                break;
            case 'right':
                fishData.targetX = tankWidth + FISH_DIMENSION;
                fishData.targetY = currentY;
                fishData.facingRight = true;
                break;
            case 'top':
                fishData.targetX = currentX;
                fishData.targetY = -FISH_DIMENSION * 2;
                break;
            case 'bottom':
                fishData.targetX = currentX;
                fishData.targetY = tankHeight + FISH_DIMENSION;
                break;
        }
    }

    function applyFishPosition(fishData) {
        fishData.element.style.left = fishData.x + 'px';
        fishData.element.style.top = fishData.y + 'px';
        const scaleX = fishData.facingRight ? 1 : -1;
        fishData.svgElement.style.transform = `scaleX(${scaleX})`;
    }

    function updateAllFishPositions() {
        if (!fishTankContainer || fishTankContainer.clientWidth === 0) return;
        const tankWidth = fishTankContainer.clientWidth;
        const tankHeight = fishTankContainer.clientHeight;

        for (const id in activeFish) {
            const fish = activeFish[id];
            const dx = fish.targetX - fish.x;
            const dy = fish.targetY - fish.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < fish.speed * 2.5) {
                if (fish.isExiting) {
                    if (fish.x >= tankWidth + FISH_DIMENSION ||        // Exited right
                        fish.x < -FISH_DIMENSION * 2 ||        // Exited left
                        fish.y >= tankHeight + FISH_DIMENSION ||     // Exited bottom
                        fish.y < -FISH_DIMENSION * 2) {       // Exited top
                        fish.element.remove();
                        delete activeFish[id];
                        continue; 
                    }
                } else {
                    fish.targetX = Math.random() * (tankWidth - FISH_DIMENSION);
                    fish.targetY = Math.random() * (tankHeight - FISH_DIMENSION);
                }
            } else {
                fish.x += (dx / distance) * fish.speed;
                fish.y += (dy / distance) * fish.speed;
            }

            if (!fish.isExiting) {
                 if (dx > 0 && !fish.facingRight) {
                    fish.facingRight = true;
                } else if (dx < 0 && fish.facingRight) {
                    fish.facingRight = false;
                }
                if (fish.x < 0) { fish.x = 0; fish.targetX = Math.random() * (tankWidth - FISH_DIMENSION); fish.facingRight = true; }
                if (fish.x > tankWidth - FISH_DIMENSION) { fish.x = tankWidth - FISH_DIMENSION; fish.targetX = Math.random() * (tankWidth - FISH_DIMENSION); fish.facingRight = false;}
                if (fish.y < 0) { fish.y = 0; fish.targetY = Math.random() * (tankHeight - FISH_DIMENSION); }
                if (fish.y > tankHeight - FISH_DIMENSION) { fish.y = tankHeight - FISH_DIMENSION; fish.targetY = Math.random() * (tankHeight - FISH_DIMENSION); }
            } else {
                if (fish.targetX > fish.x && !fish.facingRight) {
                    fish.facingRight = true;
                } else if (fish.targetX < fish.x && fish.facingRight) {
                    fish.facingRight = false;
                }
            }
            applyFishPosition(fish);
        }
    }

    function formatPhoneNumber(phoneNumberString) {
        const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
        return phoneNumberString;
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

            if (fishTankContainer) {
                const loadedContactIds = new Set(data.results ? data.results.map(c => c.id) : []);
                for (const fishIdStr in activeFish) {
                    const fishId = parseInt(fishIdStr, 10); 
                    if (!loadedContactIds.has(fishId) && activeFish[fishIdStr] && !activeFish[fishIdStr].isExiting) {
                         markFishForRemoval(fishIdStr);
                    }
                }
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

                    if (fishTankContainer && contact.id) {
                        addOrUpdateFish(contact); 
                    }
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
        if (fishTankContainer && contact.id) {
            markFishForRemoval(String(contact.id));
        }

        const payload = {
            userId: userId,
            firstName: contact.firstName,
            lastName: contact.lastName,
            phone: contact.Phone, 
            email: contact.Email,
            id: contact.id
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
                loadContacts(); 
            }
        } catch (error) {
            showMessage('Failed to delete contact: ' + error, true);
            console.error('Error deleting contact:', error);
            loadContacts();
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
            cancelCurrentEdit();
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
        confirmIcon.textContent = '✓';
        confirmIcon.title = 'Confirm Edit';
        confirmIcon.style.cursor = 'pointer';
        confirmIcon.addEventListener('click', () => handleConfirmUpdate());
        tdActions.appendChild(confirmIcon);

        const cancelIcon = document.createElement('span');
        cancelIcon.textContent = '✗';
        cancelIcon.title = 'Cancel Edit';
        cancelIcon.style.cursor = 'pointer';
        cancelIcon.addEventListener('click', () => cancelCurrentEdit());
        tdActions.appendChild(cancelIcon);
        
        const inputs = { firstNameInput: inputFirstName, lastNameInput: inputLastName, phoneInput: inputPhone, emailInput: inputEmail };
        
        Object.values(inputs).forEach(input => {
            input.addEventListener('input', () => updateEditConfirmButtonState(confirmIcon, inputs));
        });
        
        updateEditConfirmButtonState(confirmIcon, inputs);
    }

    function cancelCurrentEdit() {
        editingContactRowElement = null;
        originalContactData = null;
        loadContacts();
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

    if (searchContactsInput) {
        searchContactsInput.addEventListener('input', function() {
            const searchTerm = searchContactsInput.value.trim();
            if (searchTerm.length >= 2) {
                loadContacts(searchTerm);
            } else if (searchTerm.length === 0) {
                loadContacts('');
            }
        });
    }

    initFishTank();
    loadContacts();
    updateAddButtonState(); 
}); 