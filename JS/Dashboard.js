$(document).ready(function () {
    loadDashboardData();
});

function loadDashboardData() {
    let token = localStorage.getItem("JWT");
    let headers = (token && token !== "null" && token !== "undefined") ? { 'Authorization': 'Bearer ' + token } : {};

    let fetchBooks = function(url) {
        $.ajax({
            url: url,
            type: "GET",
            headers: headers,
            success: function (response) {
                console.log("Books response:", response);
                let list = (response && response.data) ? response.data : ((response && response.body) ? response.body : response);
                if (Array.isArray(list)) {
                    $("#stat-total-books").text(list.length);
                } else if (url.includes("/all")) {
                    fetchBooks("http://localhost:8080/api/books");
                }
            },
            error: function () {
                if (url.includes("/all")) {
                    fetchBooks("http://localhost:8080/api/books");
                }
            }
        });
    };
    fetchBooks("http://localhost:8080/api/books/all");

    let fetchRentals = function(url) {
        $.ajax({
            url: url,
            type: "GET",
            headers: headers,
            success: function (response) {
                console.log("Rentals response:", response);
                let list = (response && response.data) ? response.data : ((response && response.body) ? response.body : response);
                if (Array.isArray(list)) {
                    $("#stat-active-rentals").text(list.length);
                    renderRecentRentals(list.slice(0, 5));
                } else if (url.includes("/all")) {
                    fetchRentals("http://localhost:8080/api/rentals");
                } else {
                    renderRecentRentals([]);
                }
            },
            error: function () {
                if (url.includes("/all")) {
                    fetchRentals("http://localhost:8080/api/rentals");
                } else {
                    renderRecentRentals([]);
                }
            }
        });
    };
    fetchRentals("http://localhost:8080/api/rentals/all");

    let fetchFines = function(url) {
        $.ajax({
            url: url,
            type: "GET",
            headers: headers,
            success: function (response) {
                console.log("Fines response:", response);
                let list = (response && response.data) ? response.data : ((response && response.body) ? response.body : response);
                if (Array.isArray(list)) {
                    let unpaidCount = list.filter(f => (f.status || f.fineStatus) === 'UNPAID').length;
                    $("#stat-unpaid-fines").text(unpaidCount);
                } else if (url.includes("/all")) {
                    fetchFines("http://localhost:8080/api/fines");
                }
            },
            error: function () {
                if (url.includes("/all")) {
                    fetchFines("http://localhost:8080/api/fines");
                }
            }
        });
    };
    fetchFines("http://localhost:8080/api/fines/all");

    let fetchUsers = function(url) {
        $.ajax({
            url: url,
            type: "GET",
            headers: headers,
            success: function (response) {
                console.log("Users response:", response);
                let list = (response && response.data) ? response.data : ((response && response.body) ? response.body : response);
                if (Array.isArray(list)) {
                    $("#stat-total-users").text(list.length);
                } else if (url.includes("/all")) {
                    fetchUsers("http://localhost:8080/api/users");
                }
            },
            error: function () {
                if (url.includes("/all")) {
                    fetchUsers("http://localhost:8080/api/users");
                }
            }
        });
    };
    fetchUsers("http://localhost:8080/api/users/all");
}

function renderRecentRentals(rentals) {
    let rows = "";
    if (!rentals || rentals.length === 0) {
        rows = '<tr><td colspan="7" style="text-align: center; color: var(--text-dim);">No recent rental records found.</td></tr>';
    } else {
        rentals.forEach(r => {
            let rId = r.id || r.rentalId || "-";
            let uName = r.username || (r.userId ? 'User #' + r.userId : 'Member');
            let bTitle = r.bookTitle || (r.bookId ? 'Book #' + r.bookId : 'Book');
            let status = r.status || r.rentalStatus || 'PENDING';

            let badgeClass = 'badge-pending';
            if (status === 'APPROVED') badgeClass = 'badge-approved';
            if (status === 'RETURNED') badgeClass = 'badge-returned';
            if (status === 'OVERDUE') badgeClass = 'badge-overdue';

            rows += `
                <tr>
                    <td>#${rId}</td>
                    <td>${uName}</td>
                    <td>${bTitle}</td>
                    <td>${r.borrowDate ? r.borrowDate.replace('T', ' ') : '-'}</td>
                    <td>${r.dueDate ? r.dueDate.replace('T', ' ') : '-'}</td>
                    <td>${r.returnDate ? r.returnDate.replace('T', ' ') : '-'}</td>
                    <td><span class="badge ${badgeClass}">${status}</span></td>
                </tr>
            `;
        });
    }
    $("#recent-rentals-tbody").html(rows);
}