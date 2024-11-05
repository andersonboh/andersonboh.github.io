const socket = new WebSocket('ws://0.0.0.0:8888/register');

function registerUser(username, password) {
    const registrationData = {
        username: username,
        password: password
    };

    socket.send(JSON.stringify(registrationData));
}

socket.addEventListener('open', (event) => {
    console.log('Conexão WebSocket estabelecida');
});

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match.';
        return;
    }

    localStorage.setItem("userCurrent", username);
    registerUser(username, password)


    /*window.location.href = "home.html";*/
});

socket.addEventListener('message', (event) => {
    const response = JSON.parse(event.data);
    errorMessage.textContent = '';

    if (response.status === 'success') {
        window.location.href = "home.html";
    } else if (response.status === 'error') {
        errorMessage.textContent = response.message;
        errorMessage.style.color = 'red';
    }
});
