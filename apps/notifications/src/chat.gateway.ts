// chat.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  path: '/socket.io/', // Custom WebSocket path
  cors: {
    origin: '*',  // Allow any origin (adjust this for your production environment)
    credentials: true
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;  // Reference to the WebSocket server
  private logger: Logger = new Logger('ChatGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connected', `Welcome to the chat, client ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Handle client joining a room based on UUID
  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, payload: {uuid: string, user: string, uid: number }): void {
    client.join(payload.uuid); // Join the client to the room with UUID
    this.logger.log(`User ${payload.user} joined room ${payload.uuid}`);
    
    // Notify other clients in the room (optional)
    client.to(payload.uuid).emit('joinedRoom', { user: payload.user, uid: payload.uid });
  }

  // Listen for "message" events from the client and broadcast it within the room
  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: { uuid: string; user: string; uid: number, message: string }): void {
    this.logger.log(`Message from ${client.id} to room ${payload.uuid}: ${payload.message}`);

    // Broadcast the message to all users in the room except the sender
    this.server.to(payload.uuid).emit('message', payload);
  }
}
