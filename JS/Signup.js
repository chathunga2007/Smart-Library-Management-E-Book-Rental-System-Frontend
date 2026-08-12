function handleSignup(){
    let username = $("#username").val().trim();
    let password = $("#password").val().trim();
    let confirmPassword = $("#confirmPassword").val().trim();
    let role = $("#role").val().trim();

    if(!username) {
        alert("Please enter Username.");
        return;
    }
    if(!password) {
        alert("Please enter Password.");
        return;
    }
    if(password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }
    if(!role) {
        alert("Please select User Role.");
        return;
    }
    
    let email = $("#email").length && $("#email").val() ? $("#email").val().trim() : (username + "@gmail.com");

    let obj = JSON.stringify({
        "username": username,
        "email": email,
        "password": password,
        "role": role,
        "userStatus": "ACTIVE"
    });

    let ajaxConfig = {
        url: "http://localhost:8080/api/users/saveUser",
        type: "POST",
        contentType: "application/json",
        data: obj,
        success: function(response){
            console.log(response);
            alert("User registered successfully!");
            window.location.href = "login.html";
        },
        error: function(response){
            if(response.status === 409){
                alert("Username already exists.");
            } else {
                alert("Registration failed. Please try again.");
            }
        }
    };

    let jwt = localStorage.getItem("JWT");
    if (jwt && jwt !== "null") {
        ajaxConfig.headers = {
            'Authorization': 'Bearer ' + jwt
        };
    }

    $.ajax(ajaxConfig);
}
