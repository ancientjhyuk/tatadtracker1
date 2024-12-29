const reservationForm = document.getElementById('reservationForm');
const reservationTable = document.getElementById('reservationTable').querySelector('tbody');
const copyTableButton = document.getElementById('copyTable');
const clearAllButton = document.getElementById('clearAll');
const undoLastButton = document.getElementById('undoLast');

let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
let removedReservations = [];

// Function to get current date and time in Central Time
function updateCentralTime() {
    const options = { timeZone: 'America/Chicago', hour12: true };
    const date = new Date().toLocaleDateString('en-US', options);
    const time = new Date().toLocaleTimeString('en-US', options);
    return { date, time };
}

// Function to update hidden date and time fields
function updateTimestamps() {
    const { date, time } = updateCentralTime();
    document.getElementById('date').value = date;
    document.getElementById('time').value = time;
}

// Load data and populate hidden fields on page load
document.addEventListener('DOMContentLoaded', () => {
    updateTimestamps();
    reservations.forEach(addReservationToTable);
});

// Handle form submission
reservationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(reservationForm);
    const newReservation = {};
    for (const [key, value] of formData.entries()) {
        newReservation[key] = value;
    }

    // Add reservation to array and localStorage
    reservations.push(newReservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));
    addReservationToTable(newReservation);

    reservationForm.reset();
    updateTimestamps();
});

function addReservationToTable(reservation) {
    const row = document.createElement('tr');
    const columns = [
        reservation.date,
        reservation.time,
        reservation.ptr,
        reservation.agentName,
        reservation.passengerName,
        reservation.callerName,
        'AMN100', // DK (fixed)
        'F75G',   // PCC (fixed)
        reservation.pnr,
        reservation.source,
        reservation.transaction || 'N/A',
        'No', // AH Fee (fixed)
        reservation.remarks
    ];

    columns.forEach((col) => {
        const cell = document.createElement('td');
        cell.textContent = col;
        row.appendChild(cell);
    });

    // Add remove button
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.classList.add('remove-btn');
    removeButton.addEventListener('click', () => removeReservation(row, reservation));
    const actionsCell = document.createElement('td');
    actionsCell.appendChild(removeButton);
    row.appendChild(actionsCell);

    reservationTable.appendChild(row);
}

// Remove reservation from table and array
function removeReservation(row, reservation) {
    row.remove();
    reservations = reservations.filter((res) => res !== reservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));
    removedReservations.push(reservation);
}

// Clear all reservations
clearAllButton.addEventListener('click', () => {
    reservationTable.innerHTML = '';
    localStorage.removeItem('reservations');
    reservations = [];
    removedReservations = [];
});

// Undo last removal
undoLastButton.addEventListener('click', () => {
    if (removedReservations.length > 0) {
        const lastRemoved = removedReservations.pop();
        reservations.push(lastRemoved);
        localStorage.setItem('reservations', JSON.stringify(reservations));
        addReservationToTable(lastRemoved);
    }
});

// Copy table to clipboard
copyTableButton.addEventListener('click', () => {
    const rows = Array.from(reservationTable.querySelectorAll('tr')).map((row) =>
        Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent).join('\t')
    );
    const tableText = rows.join('\n');
    navigator.clipboard.writeText(tableText).then(() => alert('Table copied to clipboard!'));
});
