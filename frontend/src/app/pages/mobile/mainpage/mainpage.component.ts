import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { StateMachineService } from 'src/app/global/services';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/global/services';
import { UserModel } from 'src/app/global/models';

@Component({
  selector: 'ami-fullstack-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MainpageComponent implements OnInit {
  round: string;
  myUserID: string;
  players: UserModel[];

  private async initializePlayers() {
    this.players = await this.userService.getAllUsers().toPromise();
  }

  constructor(private statemachineService: StateMachineService,
    private userService: UsersService,
    private router: Router
  ) {
  }

  async ngOnInit() {
    // this.round = await this.statemachineService.getRound().toPromise().catch(e=>console.log(e));
    this.myUserID = localStorage.getItem("username");
    console.log("User id" + this.myUserID);
    if (this.myUserID == null) this.goBack();
    this.initializePlayers();
    document.addEventListener("ready", function () {
      window.scrollTo(0, document.body.scrollHeight);
      document.body.requestFullscreen();
    },false);

  }

  goBack() {
    console.log("Going back to login no logged in user");
    this.router.navigate(['/mobile/login']);
  }

  public isVoting() {
    // return this.votingphase;
  }
  public isWaiting() {
    return this.round == "Waiting";
  }
  public isDay() {
    // return this.dayphase;
  }
}
