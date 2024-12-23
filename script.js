const reservationForm = document.getElementById('reservationForm');
const reservationTable = document.getElementById('reservationTable').querySelector('tbody');
const copyTableButton = document.getElementById('copyTable');
const clearAllButton = document.getElementById('clearAll');
const undoLastButton = document.getElementById('undoLast');

let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
let removedReservations = [];  // Track multiple removed reservations

// Function to get current date and time in Central Time
function updateCentralTime() {
    const options = { timeZone: 'America/Chicago', hour12: true };
    const date = new Date().toLocaleDateString('en-US', options);
    const time = new Date().toLocaleTimeString('en-US', options);
    return { date, time };
}

function updateTimestamps() {
    const { date, time } = updateCentralTime();
    document.getElementById('date').value = date;
    document.getElementById('time').value = time;
}

reservationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(reservationForm);
    const newReservation = {};
    for (const [key, value] of formData.entries()) {
        newReservation[key] = value;
    }

    // Ensure date and time are updated for the first reservation
    if (!newReservation.date || !newReservation.time) {
        updateTimestamps(); // Set the current time and date on form submission
        newReservation.date = document.getElementById('date').value;
        newReservation.time = document.getElementById('time').value;
    }

    reservations.push(newReservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));

    addReservationToTable(newReservation);

    reservationForm.reset();
    updateTimestamps();  // Reset time and date after adding new reservation
});

function addReservationToTable(reservation) {
    const row = document.createElement('tr');
    for (const key in reservation) {
        const cell = document.createElement('td');
        cell.textContent = reservation[key];
        row.appendChild(cell);
    }

    const removeCell = document.createElement('td');
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => removeReservation(reservation, row));
    removeCell.appendChild(removeButton);
    row.appendChild(removeCell);

    reservationTable.appendChild(row);
}

function loadReservations() {
    reservations.forEach(addReservationToTable);
}

loadReservations();

// Remove reservation from table and store it for undo functionality
function removeReservation(reservation, row) {
    removedReservations.push(reservation);  // Push to removedReservations array
    reservations = reservations.filter(r => r !== reservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));
    row.remove();
}

// Undo Last functionality
undoLastButton.addEventListener('click', () => {
    if (removedReservations.length > 0) {
        const lastRemoved = removedReservations.pop();  // Get the most recent removed reservation
        reservations.push(lastRemoved);
        localStorage.setItem('reservations', JSON.stringify(reservations));
        addReservationToTable(lastRemoved);
    }
});

// Copy table to clipboard
copyTableButton.addEventListener('click', () => {
    let tableData = '';
    const rows = reservationTable.querySelectorAll('tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let rowData = '';
        cells.forEach(cell => {
            rowData += cell.textContent + '\t';  // Add tab between columns
        });
        tableData += rowData.trim() + '\n';  // Add newline after each row
    });
    navigator.clipboard.writeText(tableData).then(() => {
        alert('Table copied to clipboard!');
    }).catch(err => {
        alert('Failed to copy table: ' + err);
    });
});

// Clear All functionality
clearAllButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all reservations?')) {
        reservations = [];
        removedReservations = [];
        localStorage.removeItem('reservations');
        reservationTable.innerHTML = '';  // Clear the table
    }
});
