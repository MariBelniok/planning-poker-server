import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'lobby',
})
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  players = [];

  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AppGateway');

  handleConnection(client: Socket, payload: any) {
    this.logger.log(`Client connected:`, client, payload);
    this.meID(client.id);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  meID(id: string) {
    this.server.emit('meID', { id });
  }

  @SubscribeMessage('joinRoom')
  joinRoom(@MessageBody() data: any) {
    this.players = [
      ...this.players,
      {
        id: data.id,
        name: data.name,
        point: undefined,
      },
    ];

    this.getRoom();
  }

  @SubscribeMessage('setPoint')
  setPoint(@MessageBody() data: any) {
    this.players = this.players.map((player) =>
      player.id === data.id ? { ...player, point: data.point } : player,
    );

    this.getRoom();
  }

  getRoom() {
    this.server.emit('getRoom', this.players);
  }
}
