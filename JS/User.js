$(document).ready(function() {
    loadAllUsers();
});

function handleSave(){
    let username = ($('#username').val() || $('#user-username').val() || '').trim();
    let email = ($('#email').val() || $('#user-email').val() || '').trim();
    let password = ($('#password').val() || $('#user-password').val() || '').trim();
    let role = $('#role').val() || $('#user-role').val() || "MEMBER";
    let userStatus = $('#userStatus').val() || $('#user-status').val() || "ACTIVE";

    if(!username) {
        alert("Please enter Username.");
        return;
    }
    if(!email) {
        alert("Please enter Email.");
        return;
    }
    if(!password) {
        alert("Please enter Password.");
        return;
    }

    let obj = JSON.stringify({
        "username": username,
        "email": email,
        "password": password,
        "role": role,
        "userStatus": userStatus
    });

    $.ajax({
        url: "http://localhost:8080/api/users/saveUser",
        type: "POST",
        contentType: "application/json",
        data: obj,
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response){
            console.log(response);
            alert("User saved successfully!");
            handleClear();
            if(typeof closeModal === 'function') closeModal('modal-add-user');
            loadAllUsers();
        },
        error: function(response){
            console.error("Error saving user:", response);
            alert("Error saving user.");
        }
    });
}

function handleUpdate(){
    let userId = ($('#userId').val() || $('#edit-user-id').val() || '').trim();
    let username = ($('#username').val() || $('#edit-user-username').val() || '').trim();
    let email = ($('#email').val() || $('#edit-user-email').val() || '').trim();
    let password = ($('#password').val() || $('#edit-user-password').val() || '').trim();
    let role = $('#role').val() || $('#edit-user-role').val() || "MEMBER";
    let userStatus = $('#userStatus').val() || $('#edit-user-status').val() || "ACTIVE";

    if(!userId) {
        alert("Please select a user to update!");
        return;
    }
    if(!username) {
        alert("Please enter Username.");
        return;
    }
    if(!email) {
        alert("Please enter Email.");
        return;
    }

    let payload = {
        "id": parseInt(userId),
        "userId": parseInt(userId),
        "username": username,
        "userName": username,
        "email": email,
        "role": role,
        "userStatus": userStatus
    };
    if (password) {
        payload.password = password;
    }

    let obj = JSON.stringify(payload);

    $.ajax({
        url: "http://localhost:8080/api/users",
        type: "PUT",
        contentType: "application/json",
        data: obj,
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response){
            console.log(response);
            alert("User updated successfully!");
            handleClear();
            if(typeof closeModal === 'function') closeModal('modal-edit-user');
            loadAllUsers();
        },
        error: function(response){
            console.error("Error updating user:", response);
            alert("Error updating user.");
        }
    });
}

function handleDelete(id){
    let userId = id || ($('#userId').val() || $('#edit-user-id').val() || '').trim();

    if(!userId) {
        alert("Please select or enter a User ID to delete!");
        return;
    }

    if(!confirm("Are you sure you want to delete User ID: " + userId + "?")) {
        return;
    }

    $.ajax({
        url: "http://localhost:8080/api/users/" + userId,
        type: "DELETE",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response){
            console.log(response);
            alert("User deleted successfully!");
            handleClear();
            loadAllUsers();
        },
        error: function(response){
            console.error("Error deleting user:", response);
            alert("Error deleting user.");
        }
    });
}

function handleSearch(){
    let query = ($('#search-user-id').val() || $('#filterUsername').val() || '').trim();
    if (!query) {
        query = prompt("Enter User ID to search:");
    }
    if(!query) return;

    $.ajax({
        url: "http://localhost:8080/api/users/" + query,
        type: "GET",
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem("JWT")
        },
        success: function(response){
            console.log(response);
            let user = response.body || response.data || response;
            if (user && (user.id || user.username)) {
                renderUserTable([user]);
            } else {
                alert("User not found.");
            }
        },
        error: function(response){
            alert("User not found.");
        }
    });
}

function handleFilter(){
    let searchName = ($('#filterUsername').val() || $('#search-user-id').val() || '').trim();
    if(!searchName) {
        loadAllUsers();
        return;
    }
    handleSearch();
}

function handleClear(){
    $('#userId, #edit-user-id, #search-user-id').val('');
    $('#username, #user-username, #edit-user-username').val('');
    $('#email, #user-email, #edit-user-email').val('');
    $('#password, #user-password, #edit-user-password').val('');
    $('#role, #user-role, #edit-user-role').val('MEMBER');
    $('#userStatus, #user-status, #edit-user-status').val('ACTIVE');
}

function loadAllUsers(){
    let token = localStorage.getItem("JWT");
    let headers = (token && token !== "null" && token !== "undefined") ? { 'Authorization': 'Bearer ' + token } : {};

    let fetchUsers = function(url) {
        $.ajax({
            url: url,
            type: "GET",
            headers: headers,
            success: function(response){
                console.log("Users Response:", response);
                let list = (response && response.data) ? response.data : ((response && response.body) ? response.body : response);
                if (Array.isArray(list)) {
                    window.allUsersList = list;
                    renderUserTable(list);
                } else if (url.includes("/all")) {
                    fetchUsers("http://localhost:8080/api/users");
                }
            },
            error: function(response){
                if (url.includes("/all")) {
                    fetchUsers("http://localhost:8080/api/users");
                } else {
                    console.error("Failed to load users", response);
                }
            }
        });
    };
    fetchUsers("http://localhost:8080/api/users/all");
}

function renderUserTable(list) {
    let rows = "";
    if (!list || list.length === 0) {
        rows = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim);">No user accounts found.</td></tr>`;
    } else {
        list.forEach(u => {
            let uId = u.id || u.userId;
            let roleBadge = 'badge-role-member';
            let roleIcon = 'fa-user';
            if (u.role === 'ADMIN') { roleBadge = 'badge-role-admin'; roleIcon = 'fa-shield-halved'; }
            if (u.role === 'LIBRARIAN') { roleBadge = 'badge-role-librarian'; roleIcon = 'fa-user-tie'; }

            let statusBadge = u.userStatus === 'ACTIVE' ? 'badge-active' : (u.userStatus === 'INACTIVE' ? 'badge-inactive' : 'badge-deleted');
            
            let safeName = (u.username || u.userName || '').replace(/'/g, "\\'");
            let safeEmail = (u.email || '').replace(/'/g, "\\'");

            rows += `
                <tr>
                    <td>#${uId}</td>
                    <td><strong>${u.username || u.userName || '-'}</strong></td>
                    <td>${u.email || '-'}</td>
                    <td><span class="badge ${roleBadge}"><i class="fa-solid ${roleIcon}"></i> ${u.role || 'MEMBER'}</span></td>
                    <td><span class="badge ${statusBadge}">${u.userStatus || 'ACTIVE'}</span></td>
                    <td>
                        <div style="display: flex; gap: 6px;">
                            <button class="btn btn-secondary btn-sm" onclick="selectUserForEdit(${uId}, '${safeName}', '${safeEmail}', '${u.role || 'MEMBER'}', '${u.userStatus || 'ACTIVE'}')">
                                <i class="fa-solid fa-user-pen"></i> Edit
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="handleDelete(${uId})">
                                <i class="fa-solid fa-trash"></i> Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    $('#users-tbody, #userTblBody').html(rows);
}

function selectUserForEdit(id, username, email, role, userStatus) {
    $('#userId, #edit-user-id').val(id);
    $('#username, #user-username, #edit-user-username').val(username);
    $('#email, #user-email, #edit-user-email').val(email);
    $('#role, #user-role, #edit-user-role').val(role);
    $('#userStatus, #user-status, #edit-user-status').val(userStatus);
    $('#password, #user-password, #edit-user-password').val('');

    if (typeof openModal === 'function') {
        openModal("modal-edit-user");
    }
}

function loadUsers() { loadAllUsers(); }
function saveUserDetails() { handleSave(); }
function updateUserDetails() { handleUpdate(); }
function deleteUser(id) { handleDelete(id); }
function searchUserById() { handleSearch(); }
function openAddUserModal() {
    handleClear();
    if (typeof openModal === 'function') openModal("modal-add-user");
}
function editUser(id) {
    let u = (window.allUsersList || []).find(item => item.id == id || item.userId == id);
    if (u) {
        selectUserForEdit(u.id || u.userId, u.username || u.userName, u.email, u.role, u.userStatus);
    }
}