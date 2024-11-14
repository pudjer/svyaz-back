import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class WebRtcGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private clients = new Map<string, Socket>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.clients.set(client.id, client);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.clients.delete(client.id);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    client.to(room).emit('user-joined', client.id);
  }

  @SubscribeMessage('offer')
  handleOffer(client: Socket, payload: any) {
    client.to(payload.target).emit('offer', {
      sdp: payload.sdp,
      callerId: client.id,
    });
  }

  @SubscribeMessage('answer')
  handleAnswer(client: Socket, payload: any) {
    client.to(payload.target).emit('answer', { sdp: payload.sdp, answererId: client.id });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(client: Socket, payload: any) {
    client.to(payload.target).emit('ice-candidate', payload);
  }
}
