import asyncio
import websockets
import json
import argparse

parser = argparse.ArgumentParser()

parser.add_argument("-u", "--url", help="URL ou endereço IP do servidor")
parser.add_argument("-p", "--porta", type=int, help="URL ou endereço porta do servidor")

parametros = parser.parse_args()

active_chats = {}
active_users = {}

async def handler(websocket, path):
    print(f"Novo cliente conectado em {path}")
    
    path = path.lstrip('/')

    if path not in active_chats:
        active_chats[path] = set()
    active_chats[path].add(websocket)

    try:
        async for message in websocket:
            
            data = json.loads(message)

            if path == "login":
                username = data['username']
                password = data['password']
            
                if username in active_users and active_users[username] == password:
                    response = {"status": "success", "message": "Login successful."}
                else:
                    response = {"status": "error", "message": "Invalid username or password."}
            
                print("response login:", response)
                await websocket.send(json.dumps(response))
                continue

            
            elif path == "register":
                username = data['username']
                password = data['password']
                
                if username in active_users:
                    response = {"status": "error", "message": "User already exists."}
                    print("response cadastro: " , response)
                else:
                    active_users[username] = password
                    response = {"status": "success", "message": "User registered successfully."}
                    print("response cadastro: " , response)
                
                await websocket.send(json.dumps(response))
                continue

            else:
                chat = data['chat'].lstrip('/')
                msg = data['message']
            
                print(f"Mensagem recebida: {msg} no chat: {path}")
            
                for client in active_chats[path]:
                    if client != websocket:
                        await client.send(json.dumps({"chat": path, "message": msg}))
            


    except websockets.exceptions.ConnectionClosed:
        print(f"Conexão fechada no chat: {path}")
    finally:
        active_chats[path].remove(websocket)
        if not active_chats[path]:
            del active_chats[path]

async def main():
    server = await websockets.serve(handler, parametros.url, parametros.porta)
    print("Servidor WebSocket rodando em ws://{}:{}".format(parametros.url, parametros.porta))
    await server.wait_closed()

asyncio.run(main())
