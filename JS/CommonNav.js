const API_BASE_URL = "http://localhost:8080/api";
let jwtToken = localStorage.getItem("JWT");
let userId = localStorage.getItem("userId");
let currentUser = null;

$(document).ready(function () {
    let path = window.location.pathname.toLowerCase();
    let isLoginPage = path.endsWith("login.html") || path.endsWith("signup.html");

    let token = localStorage.getItem("JWT");
    let uid = localStorage.getItem("userId");

    if (!isLoginPage && (!token || token === "null" || token === "undefined")) {
        alert("Session expired or unauthorized! Please login first.");
        window.location.href = "login.html";
        return;
    }

    if (!isLoginPage) {
        fetchCurrentUserDataCommon();
        highlightActivePageLink();
    }
});

function fetchCurrentUserDataCommon() {
    let uid = localStorage.getItem("userId");
    if (!uid || uid === "null" || uid === "undefined") return;

    let token = localStorage.getItem("JWT");
    let headers = (token && token !== "null" && token !== "undefined") ? { 'Authorization': 'Bearer ' + token } : {};

    $.ajax({
        url: "http://localhost:8080/api/users/" + uid,
        type: "GET",
        headers: headers,
        success: function (response) {
            console.log("Current User Response:", response);
            let u = response.body || response.data || response;

            if (u && (u.username || u.userName || u.id)) {
                currentUser = u;
                let username = u.username || u.userName || "Member";

                $("#user-display-name").text(username);
                $("#user-display-id").text("ID: #" + uid);
                $("#user-avatar-badge").text(username.charAt(0).toUpperCase());

                if (typeof onUserDataLoaded === "function") {
                    onUserDataLoaded(currentUser);
                }
            }
        },
        error: function (err) {
            console.warn("Could not fetch user profile details:", err);
        }
    });
}

function highlightActivePageLink() {
    let currentPage = window.location.pathname.split("/").pop().toLowerCase();
    if (!currentPage) currentPage = "index.html";

    $(".sidebar-menu .nav-link").each(function () {
        let href = $(this).attr("href");
        if (href && href.toLowerCase() === currentPage) {
            $(this).addClass("active");
        } else {
            $(this).removeClass("active");
        }
    });
}

function handleLogout() {
    if (confirm("Are you sure you want to log out of the portal?")) {
        localStorage.clear();
        alert("Logged out successfully.");
        window.location.href = "login.html";
    }
}

function apiCall(endpoint, type, data, successCb, errorCb) {
    let token = localStorage.getItem("JWT");
    let headers = {
        "Content-Type": "application/json"
    };
    if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = "Bearer " + token;
    }

    $.ajax({
        url: API_BASE_URL + endpoint,
        type: type,
        headers: headers,
        data: data ? JSON.stringify(data) : null,
        success: function (response) {
            if (successCb) successCb(response);
        },
        error: function (xhr, status, error) {
            console.error("API Error:", xhr);
            if (xhr.status === 401 || xhr.status === 403) {
                alert("Session expired or unauthorized. Redirecting to login...");
                window.location.href = "login.html";
            } else if (errorCb) {
                errorCb(xhr);
            } else {
                alert("Request failed. Please try again.");
            }
        }
    });
}

function openModal(modalId) {
    $("#" + modalId).addClass("active");
}

function closeModal(modalId) {
    $("#" + modalId).removeClass("active");
}

function showToast(message, type = "success") {
    alert(message);
}