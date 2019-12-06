import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { StateMachineService, UsersService, SocketsService } from 'src/app/global/services';
import { Router } from '@angular/router';
import { UserModel } from 'src/app/global/models';

@Component({
  selector: 'ami-fullstack-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MainpageComponent implements OnInit {
  round: string;
  initialized: boolean = false;
  myUserID: string;
  selectedTab:number = 1;
  players: UserModel[];
  suspects: UserModel[];

  private async initializePlayers() {
    this.players = await this.usersService.getAllUsers().toPromise();
  }

  constructor(private statemachineService: StateMachineService,
    private usersService: UsersService,
    private socketService: SocketsService,
    private router: Router
  ) {
  }
  async usernameExists(username: string) {
    return await this.usersService.checkUsername(username).toPromise();
  }
  async ngOnInit() {
    // this.round = await this.statemachineService.getRound().toPromise().catch(e=>console.log(e));
    this.myUserID = localStorage.getItem("username");
    if (this.myUserID == null || !await this.usernameExists(this.myUserID)) this.goBack();
    this.round = <string>await this.statemachineService.getRound().toPromise();
    this.initializePlayers().then(() => this.initialized = true);

    document.addEventListener("ready", function () {
      window.scrollTo(0, document.body.scrollHeight);
      document.body.requestFullscreen();
    }, false);

    this.socketService.syncMessages("roundChange").subscribe(msg => {
      this.round = msg.message;
      
      if(this.isVoting()){
        this.selectedTab  =2;
        
      } //ask for suspects to give to voting
    });
  }

  goBack() {
    console.log("Going back to login no logged in user");
    this.router.navigate(['/mobile/login']);
  }

  public isVoting() {
    return this.round == "Open Ballot" || this.round == 'Secret Voting' || this.round == 'Mafia Voting';
  }
  public isWaiting() {
    
    return this.round == "Waiting";
  }
  public isDay() {
    return this.round == "Open Ballot" || this.round == 'Secret Voting';
  }
  isOpenBallot() {
    return this.round == "Open Ballot" ;
  }
  isMafiaVoting() {
    return this.round == 'Mafia Voting';
  }
  isSecretVoting() {
    return this.round == 'Secret Voting';
  }
}
