import { Component, OnInit } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { UsersService } from 'src/app/global/services';
import { UserModel } from 'src/app/global/models';

@Component({
  selector: 'ami-fullstack-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  waitingphase: boolean;
  public flips: boolean[] = [];
  players: UserModel[];
  public player = {
    name: "Julia",
    avatar_path: "/assets/players/mobile_player1.png",
    role: "mafia"

  };
  private async initializePlayers() {
    this.players = await this.userService.getAllUsers().toPromise(); //FIXME: this should be somewhere else
    this.players.forEach((item, index) => {
      this.flips[index] = false;
    });;
  }
  public toggleflip(index: number) {
    console.log("hot")
    this.flips[index] = !this.flips[index];
  }
  public flipall() {
    //initial thought of majority
    // let tmp:boolean = !(this.flips.filter(current=>current).length >= this.flips.length);
    let tmp: boolean = this.flips.filter(current => current).length != 0 ? false : true;
    this.flips.forEach((item, index) => { this.flips[index] = tmp; });
  }

  public isWaiting() {
    return this.waitingphase;
  }

  constructor(private userService: UsersService) {
    this.waitingphase = false;
  }

  async ngOnInit() {
    await this.initializePlayers();
  }

}
