import { Component, OnInit } from '@angular/core';
import { UsersService, SocketsService, StateMachineService } from 'src/app/global/services';
import { UserModel } from 'src/app/global/models';

@Component({
  selector: 'ami-fullstack-signin-table',
  templateUrl: './signin-table.component.html',
  styleUrls: ['./signin-table.component.scss']
})
export class SigninTableComponent implements OnInit {

  joined_players: number = 0;
  qrs: string[];
  players: UserModel[];

  constructor(
    private userService: UsersService,
    private stateMachine: StateMachineService,
    private socketService: SocketsService
  ) {
    this.qrs = [];
    this.players = [];
  }

  async ngOnInit() {
    this.joined_players = <number>(await this.userService.joinedPlayers().toPromise());
    console.log(this.joined_players);

    this.players = await this.userService.getAllUsers().toPromise();
    
    this.socketService.syncMessages("playerJoined").subscribe(msg => {
      this.joined_players++;
      let newPlayer = new UserModel;
      newPlayer.name = msg.message.name;
      newPlayer.role = msg.message.role;
      newPlayer.avatar_path = msg.message.avatar_path;
      newPlayer.position = msg.message.position;
      newPlayer.dead = msg.message.dead; 
      this.players.push(newPlayer);
    });

    for (var i = 0; i < 7; i++) {
      this.qrs.push(`https://api.qrserver.com/v1/create-qr-code/?size=92x92&data=http://192.168.1.7:4200/mobile/login?position=${i}`)
    }
  }

  readyToPlay() {
    return this.joined_players == 7;
  }
}
