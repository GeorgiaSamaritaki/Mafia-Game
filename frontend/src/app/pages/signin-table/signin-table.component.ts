import { Component, OnInit } from '@angular/core';
import { UsersService, SocketsService } from 'src/app/global/services';


@Component({
  selector: 'ami-fullstack-signin-table',
  templateUrl: './signin-table.component.html',
  styleUrls: ['./signin-table.component.scss']
})
export class SigninTableComponent implements OnInit {

  joined_players: number = 0; 
  qr = "https://api.qrserver.com/v1/create-qr-code/?size=92x92&data=http://192.168.1.7:4200/mobile/login?position=1";

  constructor(
    private userService: UsersService,
    private socketService: SocketsService
  ) { }

  async ngOnInit() {
    this.joined_players = <number> (await this.userService.joinedPlayers().toPromise() );
    console.log(this.joined_players);

    this.socketService.syncMessages("playerJoined").subscribe(msg=>{
      console.log(`${msg.message.name} joined`);
      this.joined_players++;
    });
  }

  readyToPlay() {
    return this.joined_players == 7;
  }
}
