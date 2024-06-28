const predefinedUsers = {
    'performer1': 'ready',
    'performer2': 'ready',
    'performer3': 'ready',
    'performer4': 'ready',
    'performer5': 'ready',
    'performer6': 'ready',
    'performer7': 'ready',
    'performer8': 'ready',
    'performer9': 'ready',
    'performer10': 'ready',
};

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    if (predefinedUsers[username] && predefinedUsers[username] === password) {
        sessionStorage.clear();
        sessionStorage.setItem('performer', username);
        window.location.href = 'interface_client.html';
    } else {
        errorMessage.textContent = 'Invalid username or password';
    }
}