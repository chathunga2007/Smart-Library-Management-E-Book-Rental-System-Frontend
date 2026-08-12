function handleLogin() {
    let userName = $('#userName').val().trim();
    let password = $('#password').val().trim();

    if (!userName) {
        alert("Please enter Username.");
        return;
    }
    if (!password) {
        alert("Please enter Password.");
        return;
    }

    let obj = JSON.stringify({
        "username": userName,
        "password": password
    });

    $.ajax({
        url: "http://localhost:8080/api/users/login",
        type: "POST",
        contentType: "application/json",
        data: obj,
        success: function (response) {
            console.log(response);

            let token = response.body ? response.body.token : (response.data ? response.data.token : response.token);
            let userId = response.body ? response.body.userId : (response.data ? response.data.userId : response.userId);

            if (token) {
                localStorage.setItem("JWT", token);
                localStorage.setItem("userId", userId);

                console.log(localStorage.getItem("JWT"));
                alert("Login Successfully!");

                window.location.href = "index.html";
            } else {
                alert(response.message || "Invalid Credentials");
            }
        },
        error: function (response) {
            if (response.status === 403 || response.status === 404 || response.status === 401) {
                alert("Invalid Credentials");
            } else {
                alert("Login failed. Please try again.");
            }
        }
    });
}