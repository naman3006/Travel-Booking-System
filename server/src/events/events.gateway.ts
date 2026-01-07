import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class EventsGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        // Basic log. For production, verify token in handshake.query.token
        // console.log('Client connected:', client.id);
    }

    @SubscribeMessage('joinRoom')
    handleJoinRoom(client: Socket, userId: string) {
        // console.log(`Client ${client.id} joined room ${userId}`);
        client.join(userId);
    }

    // Notify a specific user (by joining room = userId)
    notifyUser(userId: string, event: string, payload: any) {
        this.server.to(userId).emit(event, payload);
    }

    // Notify all admins (by joining room = 'admin')
    notifyAdmins(event: string, payload: any) {
        this.server.emit(event, payload); // For simplicity, broadcasting to all for now, or use a specific room
    }

    // Broadcast to everyone (e.g. "Someone just booked a trip!")
    broadcastToAll(event: string, payload: any) {
        this.server.emit(event, payload);
    }
}
