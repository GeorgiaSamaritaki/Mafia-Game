import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/global/services';

@Component({
  selector: 'ami-fullstack-signin-table',
  templateUrl: './signin-table.component.html',
  styleUrls: ['./signin-table.component.scss']
})
export class SigninTableComponent implements OnInit {

  joined_players: Number = 0; 
  qr = "https://api.qrserver.com/v1/create-qr-code/?size=92x92&data=http://localhost:4200/mobile/login";

  constructor(
    private userService: UsersService
  ) { }

  async ngOnInit() {
    this.joined_players = (await this.userService.getAllUsers().toPromise()).length;
    console.log(this.joined_players) 
  }

  readyToPlay() {
    return this.joined_players == 7;
  }
}
