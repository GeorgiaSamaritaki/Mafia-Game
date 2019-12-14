import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { StateMachineService, UsersService, SocketsService, VotingService } from 'src/app/global/services';
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
  voted: boolean = false;
  canVote: boolean = false;
  role: string;
  username: string;
  selectedTab: number = 1;
  players: UserModel[];
  suspects: UserModel[];

  private async initializePlayers() {
    this.players = await this.usersService.getAllUsers().toPromise(); //this shouldnt be kept here but for the sake of this demo
    let from: number;
    this.players.forEach((user: UserModel, index: number) => { if (user.name == this.username) { from = index; this.role = user.role; } });
    this.players.splice(0, 0, this.players.splice(from, 1)[0]);
    if (this.role == "" || this.role == undefined){//FIXME: Should exit not patch
      console.log("ERROR: Player has not been assigned a role");
      this.role = "Civilian"
    } 
    this.suspects = [];
  }

  constructor(private statemachineService: StateMachineService,
    private votingService: VotingService,
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
    this.username = localStorage.getItem("username");
    if (this.username == null || !await this.usernameExists(this.username)) this.goBack();
    this.round = <string>await this.statemachineService.getRound().toPromise();
    this.initializePlayers().then(() => this.initialized = true);
    this.initialized = true;
    this.socketService.syncMessages("roundChange").subscribe(msg => {
      if(this.round == "Waiting"){
        this.initialized = false;
        this.initializePlayers().then(() => this.initialized = true);
      }
      this.round = msg.message;
      this.voted == false;
      this.canVote = this.checkCanVote();
      if (this.isVoting()) {
        this.selectedTab = 2;
      } //ask for suspects to give to voting
    });

    this.socketService.syncMessages("suspects").subscribe(msg => {
      //youcan vote yourself always
      console.log("Mobile: suspects Received");
      msg.message.forEach((name: string) => {
        this.suspects.push(this.players.find((user: UserModel) => user.name == name));
      });
    });
  }

  submitVote(toIndex) { //called from subcomponent
    this.voted = true;
    let from = this.username, to = this.suspects[toIndex].name;
    this.votingService.vote(from, to);
  }

  goBack() {
    console.log("Going back to login no logged in user");
    this.router.navigate(['/mobile/login']);
  }

  public checkCanVote() {
    switch (this.round) {
      case 'Waiting':
        return false;
      case 'Secret Voting':
      case 'Open Ballot':
        return true;
      case 'Mafia Voting':
        return this.role == "Mafioso" || this.role == "Barman" || this.role == "Godfather";
      case 'Doctor':
        return this.role == 'Doctor';
      case 'Detective':
        return this.role == 'Doctor';
      case 'Barman':
        return this.role == 'Barman';
      default:
        console.log("Voting Controller:Error")
    }
    return false;
  }
  public isVoting() {
    return this.canVote;
  }
  public isWaiting() {
    return this.round == "Waiting";
  }
  public isDay() {
    return this.round == "Open Ballot" || this.round == 'Secret Voting';
  }
  isOpenBallot() {
    return this.round == "Open Ballot";
  }
  isMafiaVoting() {
    return this.round == 'Mafia Voting';
  }
  isSecretVoting() {
    return this.round == 'Secret Voting';
  }
}
