const reservationForm = document.getElementById('reservationForm');
const reservationTable = document.getElementById('reservationTable').querySelector('tbody');
const copyTableButton = document.getElementById('copyTable');
const clearAllButton = document.getElementById('clearAll');
const undoLastButton = document.getElementById('undoLast');

let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
let removedReservations = [];  // Track removed reservations for undo

// Function to get current date and time in Central Time
function updateCentralTime() {
    const options = { timeZone: 'America/Chicago', hour12: true };
    const date = new Date().toLocaleDateString('en-US', options);
    const time = new Date().toLocaleTimeString('en-US', options);
    return { date, time };
}

// Function to update date and time fields
function updateTimestamps() {
    const { date, time } = updateCentralTime();
    document.getElementById('date').value = date;
    document.getElementById('time').value = time;
}

// Update timestamps when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateTimestamps();
});

// Handle form submission
reservationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(reservationForm);
    const newReservation = {};
    for (const [key, value] of formData.entries()) {
        newReservation[key] = value;
    }

    // Automatically update date and time if not provided
    if (!newReservation.date || !newReservation.time) {
        updateTimestamps(); // Set the current time and date on form submission
        newReservation.date = document.getElementById('date').value;
        newReservation.time = document.getElementById('time').value;
    }

    reservations.push(newReservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));
    addReservationToTable(newReservation);
    reservationForm.reset();
    updateTimestamps(); // Update time after submitting
});

function addReservationToTable(reservation) {
    const row = document.createElement('tr');

    // Add table data in the required order
    const columns = [
        reservation.date,  // Date
        reservation.time,  // Time
        reservation.ptr,   // PTR
        reservation.agentName || 'Enrico Tatad Jr.',  // Agent Name
        reservation.passengerName,  // Passenger Name
        reservation.callerName,     // Caller Name
        'AMN100',  // DK (fixed value)
        'F75G',     // PCC (fixed value)
        reservation.pnr,  // PNR
        reservation.source,  // Source
        reservation.transaction || 'N/A',  // Transaction (Optional)
        'No',  // AH Fee (fixed value)
        reservation.remarks  // Remarks
    ];

    // Create a cell for each column in the correct order
    columns.forEach((columnData) => {
        const cell = document.createElement('td');
        cell.textContent = columnData;
        row.appendChild(cell);
    });

    // Remove button
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.classList.add('remove-btn');
    removeButton.addEventListener('click', () => removeReservation(reservation, row));
    const removeCell = document.createElement('td');
    removeCell.appendChild(removeButton);
    row.appendChild(removeCell);

    reservationTable.appendChild(row);
}

function removeReservation(reservation, row) {
    removedReservations.push(reservation);
    reservations = reservations.filter(r => r !== reservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));
    reservationTable.removeChild(row);
}

copyTableButton.addEventListener('click', () => {
    let tableData = '';
    const rows = reservationTable.querySelectorAll('tr');
    rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        let rowData = '';
        cells.forEach((cell, index) => {
            rowData += cell.textContent.trim() + (index < cells.length - 1 ? '\t' : '');
        });
        tableData += rowData + '\n';
    });

    navigator.clipboard.writeText(tableData).then(() => {
        alert('Table copied to clipboard! You can now paste it into Excel.');
    }).catch(err => {
        alert('Failed to copy table: ' + err);
    });
});

clearAllButton.addEventListener('click', () => {
    reservations = [];
    localStorage.setItem('reservations', JSON.stringify(reservations));
    reservationTable.innerHTML = '';
});

undoLastButton.addEventListener('click', () => {
    if (removedReservations.length > 0) {
        const lastRemoved = removedReservations.pop();
        reservations.push(lastRemoved);
        localStorage.setItem('reservations', JSON.stringify(reservations));
        addReservationToTable(lastRemoved);
    } else {
        alert('No more reservations to undo!');
    }
});

// Load existing reservations from localStorage
reservations.forEach(addReservationToTable);
