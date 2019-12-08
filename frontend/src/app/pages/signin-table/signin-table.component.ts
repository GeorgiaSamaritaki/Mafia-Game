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
  private left_players: UserModel[];
  private right_players: UserModel[];
  private middle_players: UserModel[];

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

    this.arrangePlayers();

    for (var i = 0; i < 7; i++) {
      this.qrs.push(`https://api.qrserver.com/v1/create-qr-code/?size=92x92&data=http://192.168.1.7:4200/mobile/login?position=${i}`)
    }

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
  }

  private arrangePlayers() {
    this.left_players = [];
    this.right_players = [];
    this.middle_players = [];

    this.players.forEach(player => {
      if (player.position < (this.players.length / 3) - 1) {
        this.left_players.push(player);
      } else if (player.position > (2 * this.players.length / 3)) {
        this.right_players.push(player);
      } else {
        this.middle_players.push(player);
      }
    });
    this.left_players.sort(function (a, b) { return a.position - b.position });
    this.middle_players.sort(function (a, b) { return a.position - b.position });
    this.right_players.sort(function (a, b) { return a.position - b.position });
  }

  readyToPlay() {
    return this.joined_players == 7;
  }
}
