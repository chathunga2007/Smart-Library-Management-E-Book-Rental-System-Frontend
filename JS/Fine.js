$(document).ready(function() {
    loadAllFines();
});

function handleSave(){
    let rentalId = parseInt($('#rentalId').val() || $('#fine-rentalId').val()) || null;
    let amount = parseFloat($('#amount').val() || $('#fine-amount').val()) || 0;
    let status = $('#status').val() || $('#fine-status').val() || "UNPAID";

    if(!rentalId) {
        alert("Please enter valid Rental ID.");
        return;
    }
    if(isNaN(amount) || amount <= 0) {
        alert("Please enter valid Fine Amount.");
        return;
    }

    let obj = JSON.stringify({
        "rentalId": rentalId,
        "amount": amount,
        "status": status
    });

    $.ajax({
        url: "http://localhost:8080/api/fines",
        type: "POST",
        contentType: "application/json",
        data: obj,
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response){
            console.log(response);
            alert("Fine record created successfully!");
            handleClear();
            if(typeof closeModal === 'function') closeModal('modal-create-fine');
            loadAllFines();
        },
        error: function(response){
            console.error("Error creating fine:", response);
            alert("Error creating fine record.");
        }
    });
}

function handlePay(fineId){
    let fId = fineId || ($('#fineId').val() || $('#search-rental-id').val() || '').trim();

    if(!fId) {
        alert("Please select a fine record to pay!");
        return;
    }

    if(!confirm("Process payment for fine record #" + fId + "?")) {
        return;
    }

    $.ajax({
        url: "http://localhost:8080/api/fines/pay/" + fId,
        type: "PUT",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response){
            console.log(response);
            alert("Fine #" + fId + " paid successfully!");
            loadAllFines();
        },
        error: function(response){
            console.error("Error processing fine payment:", response);
            alert("Error processing fine payment.");
        }
    });
}

function handleDelete(id){
    let fineId = id || ($('#fineId').val() || $('#search-rental-id').val() || '').trim();

    if(!fineId) {
        alert("Please select or enter a Fine ID to delete!");
        return;
    }

    if(!confirm("Are you sure you want to delete Fine ID: " + fineId + "?")) {
        return;
    }

    $.ajax({
        url: "http://localhost:8080/api/fines/" + fineId,
        type: "DELETE",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response){
            console.log(response);
            alert("Fine record deleted successfully!");
            handleClear();
            loadAllFines();
        },
        error: function(response){
            console.error("Error deleting fine:", response);
            alert("Error deleting fine record.");
        }
    });
}

function handleSearch(){
    let rid = ($('#search-rental-id').val() || $('#filterRentalId').val() || '').trim();
    if (!rid) {
        rid = prompt("Enter Rental ID to search fines:");
    }
    if(!rid) return;

    $.ajax({
        url: "http://localhost:8080/api/fines/rental/" + rid,
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response){
            console.log(response);
            let fine = response.body || response.data || response;
            if (fine && (fine.id || fine.rentalId)) {
                renderFineTable(Array.isArray(fine) ? fine : [fine]);
            } else {
                alert("No fine record found for Rental ID: " + rid);
            }
        },
        error: function(response){
            alert("No fine record found for Rental ID: " + rid);
        }
    });
}

function handleFilter(){
    let searchId = ($('#filterRentalId').val() || $('#search-rental-id').val() || '').trim();
    if(!searchId) {
        loadAllFines();
        return;
    }
    handleSearch();
}

function handleClear(){
    $('#fineId, #rentalId, #fine-rentalId, #fine-amount, #search-rental-id, #filterRentalId').val('');
    $('#fine-status').val('UNPAID');
}

function loadAllFines(){
    let token = localStorage.getItem("JWT");
    let headers = (token && token !== "null" && token !== "undefined") ? { 'Authorization': 'Bearer ' + token } : {};

    let fetchFines = function(url) {
        $.ajax({
            url: url,
            type: "GET",
            headers: headers,
            success: function(response){
                console.log("Fines Response:", response);
                let list = (response && response.data) ? response.data : ((response && response.body) ? response.body : response);
                if (Array.isArray(list)) {
                    window.allFinesList = list;
                    renderFineTable(list);
                } else if (url.includes("/all")) {
                    fetchFines("http://localhost:8080/api/fines");
                }
            },
            error: function(response){
                if (url.includes("/all")) {
                    fetchFines("http://localhost:8080/api/fines");
                } else {
                    console.error("Failed to load fines", response);
                }
            }
        });
    };
    fetchFines("http://localhost:8080/api/fines/all");
}

function renderFineTable(list) {
    let rows = "";
    if (!list || list.length === 0) {
        rows = `<tr><td colspan="5" style="text-align: center; color: var(--text-dim);">No fine records found.</td></tr>`;
    } else {
        list.forEach(f => {
            let fId = f.id || f.fineId;
            let status = f.status || f.fineStatus || 'UNPAID';
            let badgeClass = status === 'PAID' ? 'badge-paid' : (status === 'UNPAID' ? 'badge-unpaid' : 'badge-deleted');
            
            let actions = '';
            if (status === 'UNPAID') {
                actions += `<button class="btn btn-success btn-sm" onclick="handlePay(${fId})"><i class="fa-solid fa-credit-card"></i> Pay Fine</button> `;
            } else {
                actions += `<span style="font-size:12px; color: var(--accent-emerald); font-weight:600;"><i class="fa-solid fa-check-circle"></i> Settled</span> `;
            }
            actions += `<button class="btn btn-danger btn-sm" onclick="handleDelete(${fId})"><i class="fa-solid fa-trash"></i></button>`;

            rows += `
                <tr>
                    <td>#${fId}</td>
                    <td><strong>Rental #${f.rentalId}</strong></td>
                    <td><strong style="font-size: 15px; color: ${status === 'PAID' ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">Rs. ${parseFloat(f.amount || 0).toFixed(2)}</strong></td>
                    <td><span class="badge ${badgeClass}">${status}</span></td>
                    <td><div style="display:flex; gap:6px;">${actions}</div></td>
                </tr>
            `;
        });
    }
    $('#fines-tbody, #fineTblBody').html(rows);
}

function loadFines() { loadAllFines(); }
function saveFineDetails() { handleSave(); }
function payFine(id) { handlePay(id); }
function deleteFine(id) { handleDelete(id); }
function searchFineByRental() { handleSearch(); }
function openCreateFineModal() {
    handleClear();
    if (typeof openModal === 'function') openModal("modal-create-fine");
}