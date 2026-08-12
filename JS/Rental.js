$(document).ready(function() {
    loadAllRentals();
});

function handleSave(){
    let userId = parseInt($('#userId').val() || $('#rent-userId').val()) || null;
    let username = ($('#username').val() || $('#rent-username').val() || '').trim();
    let bookId = parseInt($('#bookId').val() || $('#rent-bookId').val()) || null;
    let bookTitle = ($('#bookTitle').val() || $('#rent-bookTitle').val() || '').trim();
    let borrowDate = $('#borrowDate').val() || $('#rent-borrowDate').val();
    let dueDate = $('#dueDate').val() || $('#rent-dueDate').val();
    let status = $('#status').val() || $('#rent-status').val() || "PENDING";

    if(!userId) {
        alert("Please enter User ID.");
        return;
    }
    if(!bookId) {
        alert("Please enter Book ID.");
        return;
    }
    if(!borrowDate || !dueDate) {
        alert("Please enter Borrow Date and Due Date.");
        return;
    }

    let obj = JSON.stringify({
        "userId": userId,
        "username": username,
        "bookId": bookId,
        "bookTitle": bookTitle,
        "borrowDate": borrowDate,
        "dueDate": dueDate,
        "status": status
    });

    $.ajax({
        url: "http://localhost:8080/api/rentals",
        type: "POST",
        contentType: "application/json",
        data: obj,
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response){
            console.log(response);
            alert("Rental issue created successfully!");
            handleClear();
            if(typeof closeModal === 'function') closeModal('modal-create-rental');
            loadAllRentals();
        },
        error: function(response){
            console.error("Error creating rental:", response);
            alert("Error creating rental issue.");
        }
    });
}

function handleApprove(rentalId){
    if(!rentalId) {
        alert("Please specify Rental ID to approve.");
        return;
    }

    $.ajax({
        url: "http://localhost:8080/api/rentals/approve/" + rentalId,
        type: "PUT",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response){
            console.log(response);
            alert("Rental #" + rentalId + " approved successfully!");
            loadAllRentals();
        },
        error: function(response){
            console.error("Error approving rental:", response);
            alert("Error approving rental issue.");
        }
    });
}

function handleReturn(rentalId){
    if(!rentalId) {
        alert("Please specify Rental ID to return.");
        return;
    }

    $.ajax({
        url: "http://localhost:8080/api/rentals/return/" + rentalId,
        type: "PUT",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response){
            console.log(response);
            alert("Book returned for Rental #" + rentalId + " successfully!");
            loadAllRentals();
        },
        error: function(response){
            console.error("Error returning book:", response);
            alert("Error processing book return.");
        }
    });
}

function handleDelete(id){
    let rentalId = id || ($('#rentalId').val() || $('#search-user-id').val() || '').trim();

    if(!rentalId) {
        alert("Please select or enter a Rental ID to delete!");
        return;
    }

    if(!confirm("Are you sure you want to delete Rental ID: " + rentalId + "?")) {
        return;
    }

    $.ajax({
        url: "http://localhost:8080/api/rentals/" + rentalId,
        type: "DELETE",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response){
            console.log(response);
            alert("Rental deleted successfully!");
            handleClear();
            loadAllRentals();
        },
        error: function(response){
            console.error("Error deleting rental:", response);
            alert("Error deleting rental.");
        }
    });
}

function handleSearch(){
    let uid = ($('#search-user-id').val() || $('#filterUserId').val() || '').trim();
    if (!uid) {
        uid = prompt("Enter User ID to search rentals:");
    }
    if(!uid) return;

    $.ajax({
        url: "http://localhost:8080/api/rentals/user/" + uid,
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response){
            console.log(response);
            let list = response.body || response.data || response;
            renderRentalTable(Array.isArray(list) ? list : (list ? [list] : []));
        },
        error: function(response){
            alert("No rentals found for User ID: " + uid);
        }
    });
}

function handleFilter(){
    let searchId = ($('#filterUserId').val() || $('#search-user-id').val() || '').trim();
    if(!searchId) {
        loadAllRentals();
        return;
    }
    handleSearch();
}

function handleClear(){
    $('#rentalId, #rent-userId, #rent-username, #rent-bookId, #rent-bookTitle, #rent-borrowDate, #rent-dueDate, #search-user-id, #filterUserId').val('');
    $('#rent-status').val('PENDING');
}

function loadAllRentals(){
    let token = localStorage.getItem("JWT");
    let headers = (token && token !== "null" && token !== "undefined") ? { 'Authorization': 'Bearer ' + token } : {};

    let fetchRentals = function(url) {
        $.ajax({
            url: url,
            type: "GET",
            headers: headers,
            success: function(response){
                console.log("Rentals Response:", response);
                let list = (response && response.data) ? response.data : ((response && response.body) ? response.body : response);
                if (Array.isArray(list)) {
                    window.allRentalsList = list;
                    renderRentalTable(list);
                } else if (url.includes("/all")) {
                    fetchRentals("http://localhost:8080/api/rentals");
                }
            },
            error: function(response){
                if (url.includes("/all")) {
                    fetchRentals("http://localhost:8080/api/rentals");
                } else {
                    console.error("Failed to load rentals", response);
                }
            }
        });
    };
    fetchRentals("http://localhost:8080/api/rentals/all");
}

function renderRentalTable(list) {
    let rows = "";
    if (!list || list.length === 0) {
        rows = `<tr><td colspan="8" style="text-align: center; color: var(--text-dim);">No rental records found.</td></tr>`;
    } else {
        list.forEach(r => {
            let rId = r.id || r.rentalId;
            let status = r.status || r.rentalStatus || 'PENDING';
            let badgeClass = 'badge-pending';
            if (status === 'APPROVED') badgeClass = 'badge-approved';
            if (status === 'RETURNED') badgeClass = 'badge-returned';
            if (status === 'OVERDUE') badgeClass = 'badge-overdue';

            let actions = '';
            if (status === 'PENDING') {
                actions += `<button class="btn btn-success btn-sm" onclick="handleApprove(${rId})"><i class="fa-solid fa-check"></i> Approve</button> `;
            }
            if (status === 'APPROVED' || status === 'OVERDUE') {
                actions += `<button class="btn btn-primary btn-sm" onclick="handleReturn(${rId})"><i class="fa-solid fa-arrow-left-long"></i> Return</button> `;
            }
            actions += `<button class="btn btn-danger btn-sm" onclick="handleDelete(${rId})"><i class="fa-solid fa-trash"></i></button>`;

            rows += `
                <tr>
                    <td>#${rId}</td>
                    <td><strong>User #${r.userId}</strong><br><span style="font-size:12px; color: var(--text-muted);">${r.username || ''}</span></td>
                    <td><strong>Book #${r.bookId}</strong><br><span style="font-size:12px; color: var(--text-muted);">${r.bookTitle || ''}</span></td>
                    <td>${r.borrowDate ? r.borrowDate.replace('T', ' ') : '-'}</td>
                    <td>${r.dueDate ? r.dueDate.replace('T', ' ') : '-'}</td>
                    <td>${r.returnDate ? r.returnDate.replace('T', ' ') : '-'}</td>
                    <td><span class="badge ${badgeClass}">${status}</span></td>
                    <td><div style="display:flex; gap:6px;">${actions}</div></td>
                </tr>
            `;
        });
    }
    $('#rentals-tbody, #rentalTblBody').html(rows);
}

function loadRentals() { loadAllRentals(); }
function saveRentalDetails() { handleSave(); }
function approveRental(id) { handleApprove(id); }
function returnBook(id) { handleReturn(id); }
function deleteRental(id) { handleDelete(id); }
function searchUserRentals() { handleSearch(); }
function openCreateRentalModal() {
    handleClear();
    if (typeof openModal === 'function') openModal("modal-create-rental");
}