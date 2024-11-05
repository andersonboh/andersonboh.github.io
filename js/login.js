const socket = new WebSocket('ws://26.10.139.72:8888/login');

function loginUser(username, password) {
    const loginData = {
        username: username,
        password: password
    };

    socket.send(JSON.stringify(loginData));
}

socket.addEventListener('open', (event) => {
    console.log('Conexão WebSocket estabelecida');
});

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    localStorage.setItem("userCurrent", username);
    loginUser(username, password);
});

socket.addEventListener('message', (event) => {
    const response = JSON.parse(event.data);
    errorMessage.textContent = '';
    console.log("response" , response)

    if (response.status === 'success') {
        window.location.href = "home.html";
    } else if (response.status === 'error') {
        errorMessage.textContent = response.message;
        errorMessage.style.color = 'red';
    }
});

document.getElementById("registerButton").addEventListener("click", function() {
    window.location.href = "register.html";
});