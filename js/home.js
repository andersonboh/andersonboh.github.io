let username;
let currentChat;
const sockets = {};
const messages = JSON.parse(localStorage.getItem("messages")) || {};

username = localStorage.getItem("userCurrent");

currentChat = localStorage.getItem('currentChat') || 'ChatOne';

document.addEventListener('DOMContentLoaded', function() {
    selectConversation('ChatOne');
});

function initializeWebSockets() {
    const chatNames = ['ChatOne', 'ChatTwo', 'ChatThree'];

    chatNames.forEach(chat => {
        if (!sockets[chat]) {
            const socket = new WebSocket(`ws://0.0.0.0:8888/${chat}`);

            socket.addEventListener('open', function() {
                console.log(`Conectado ao WebSocket para ${chat}`);
            });

            socket.addEventListener('message', function(event) {
                const data = JSON.parse(event.data);
                const chatName = data.chat;

                if (chatName === chat) {
                    displayMessage(chatName, data.message);
                    if (!messages[chatName]) {
                        messages[chatName] = [];
                    }
                    messages[chatName].push(data.message);
                    saveMessages(chatName);
                }
            });

            socket.addEventListener('close', function() {
                console.log(`Desconectado do WebSocket para ${chat}`);
            });

            sockets[chat] = socket;
        }
    });

}

initializeWebSockets();

function selectConversation(conversa) {
    currentChat = conversa;
    localStorage.setItem('currentChat', currentChat);

    const conversationContent = document.getElementById('conversationContent');
    document.getElementById("chatName").textContent = currentChat;
    conversationContent.innerHTML = ''; 

    loadMessages();

    if (messages[currentChat]) {
        messages[currentChat].forEach(msg => displayMessage(currentChat, msg));
    } else {
        conversationContent.innerHTML = `<div>Selecione uma mensagem para ver os detalhes.</div>`;
    }
}

document.getElementById("messageInput").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        sendMessage(); // Chama a função de envio da mensagem
    }
});

function clearMessages() {
    let messagesCurrentChat = "messages_" + currentChat;
    console.log(messagesCurrentChat)
    localStorage.removeItem(messagesCurrentChat);

    const conversationContent = document.getElementById("conversationContent");
    if (conversationContent) {
        conversationContent.innerHTML = "";
    }
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;

    if (message && username && currentChat) {
        const formattedMessage = `${username}: ${message}`;
        
        const socket = sockets[currentChat];
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ chat: currentChat, message: formattedMessage }));
            console.log(`Mensagem enviada para ${currentChat}: ${formattedMessage}`);
        } else {
            console.error(`Não foi possível enviar a mensagem. WebSocket não está aberto para ${currentChat}`);
            return;
        }

        if (!messages[currentChat]) {
            messages[currentChat] = [];
        }
        messages[currentChat].push(formattedMessage);

        saveMessages(currentChat);
        displayMessage(currentChat, formattedMessage);

        messageInput.value = '';
    } else {
        console.log('Digite uma mensagem antes de enviar, nome de usuário ou chat não definido.');
    }
    
}

function loadMessages() {
    console.log("currentChat: " , currentChat)
    if (currentChat) {
        const savedMessages = localStorage.getItem(`messages_${currentChat}`);
        messages[currentChat] = savedMessages ? JSON.parse(savedMessages) : [];
    }
}

function saveMessages(chat) {
    localStorage.setItem(`messages_${chat}`, JSON.stringify(messages[chat]));
}

function displayMessage(chat, message) {
    /*console.log(`Exibindo mensagem no ${chat}:`, message);*/
    if (chat !== currentChat) return;

    const conversationContent = document.getElementById('conversationContent');
    const newMessage = document.createElement('div');
    newMessage.textContent = message;
    conversationContent.appendChild(newMessage);
}

document.getElementById('bottomLogout').addEventListener('click', function() {
    localStorage.removeItem("userCurrent");
    window.location.href = "login.html";
});
