import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { StateMachineService, UsersService, SocketsService, VotingService } from 'src/app/global/services';
import { Router } from '@angular/router';
import { UserModel } from 'src/app/global/models';
import { SelectMultipleControlValueAccessor } from '@angular/forms';

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
  players: UserModel[] = [];
  suspects: UserModel[] = [];
  private async initializePlayers() {
    // this.players = 
    await this.usersService.getAllUsers().toPromise().then(
      (e) => {
        this.players = e;
        let from: number;
        this.players.forEach((user: UserModel, index: number) => { if (user.name == this.username) { from = index; this.role = user.role; } });
        this.players.forEach((user: UserModel, index: number) => { if (user.name != this.username) user.role = this.knowRole(user.role) });
        this.players.splice(0, 0, this.players.splice(from, 1)[0]);
        if (this.role == "" || this.role == undefined) {//FIXME: Should exit not patch
          console.log("ERROR: Player has not been assigned a role");
          this.role = "Civilian"
        }
        this.suspects = [];
        console.log(this.players);

      }
    ); //this shouldnt be kept here but for the sake of this demo
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
    this.username = localStorage.getItem("username");
    if (this.username == null || !await this.usernameExists(this.username)) this.goBack();
    this.round = <string>await this.statemachineService.getRound().toPromise();
    this.initialized = true;
    if (this.round != "Waiting") {
      this.RetriveInfoonReload();
    }

    this.socketService.syncMessages("roundChange").subscribe(msg => {
      if (this.round == "Waiting") { //first round only
        this.initialized = false;
        this.initializePlayers().then(() => this.initialized = true);
      }
      this.round = msg.message;
      this.voted == false;

    });

    this.socketService.syncMessages("suspects").subscribe(msg => {
      //youcan vote yourself always
      console.log("Mobile: suspects Received");
      this.setSuspects(msg.message);
    });


    this.socketService.syncMessages("died").subscribe(msg => {
      console.log("User Died");
      let died: UserModel = msg.message;
      died.role = died.dead == "day" ? died.role : "hidden";
      for (let i = 0; i < this.players.length; i++)
        if (this.players[i].name == died.name) this.players[i] = died;

    });
    this.socketService.syncMessages("detective_findings").subscribe(msg => {
      if (this.role == "Detective") {
        console.log("Detective action");
        for (let i = 0; i < this.players.length; i++)
          if (this.players[i].name == msg.message.name) this.players[i] = msg.message;
      }
    });
  }
  public async RetriveInfoonReload() {
    console.log("Retrieving info on Reload"); // FIXME: need to check if this player has voted to init hasvoted var
    this.initialized = false;
    await this.votingService.getSuspects().toPromise().then(
      (e) => {
        this.setSuspects(e)
        this.initializePlayers().then(() => {
        });
      }
      );
      await(10000);
      this.initialized = true;
  }

  public setSuspects(_suspects:UserModel[]) {
    console.log("Set Suspcets")
    this.suspects = [];
    _suspects.forEach(
      (user:UserModel)=> this.suspects.push(user)
    )
    this.canVote = this.checkCanVote();
    console.log("Can vote" + this.canVote)
     if (this.isVoting())
       this.selectedTab = 2;
     else if (this.selectedTab == 2) this.selectedTab = 1;
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

  public knowRole(other_role) {
    switch (this.role) {
      case "Mafioso":
      case "Barman":
      case "Godfather":
        return (other_role == "Mafioso" || other_role == "Barman" || other_role == "Godfather") ? other_role : "hidden";
      case "Mason":
        return (other_role == "Mason") ? other_role : "hidden";
      default:
      case "Detective":
      case "Doctor":
      case "Civilian":
        return "hidden";
    }
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
