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
  dead: boolean = false;
  canVote: boolean = false;
  role: string;
  username: string;
  selectedTab: number = 1;
  players: UserModel[] = [];
  gameEnded: boolean = false;
  won: boolean = false;

  private async initializePlayers() {
    // this.players = 
    await this.usersService.getAllUsers().toPromise().then(
      (e) => {
        this.players = e;
        let from: number;
        this.players.forEach((user: UserModel, index: number) => { if (user.name == this.username) { from = index; this.role = user.role; this.dead = user.dead != "alive"; } });
        this.players.forEach((user: UserModel, index: number) => { if (user.name != this.username && user.dead != "day") user.role = this.knowRole(user.role) });
        this.players.splice(0, 0, this.players.splice(from, 1)[0]);
        if (this.role == "" || this.role == undefined) {//FIXME: Should exit not patch
          console.log("ERROR: Player has not been assigned a role");
          this.role = "Civilian"
        }
        console.log("Players Role: " + this.role);
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

  playAudio(path) {
    let audio = new Audio();
    audio.src = path;
    audio.load();
    audio.play();
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
      this.playAudio("/assets/sounds/round_change.wav");
      console.log("Mobile: Round changing"); 
      var game_init = false;
      if (this.round == "Waiting") { //first round only
        this.initialized = false;
        this.initializePlayers().then(() => this.initialized = true);
        game_init = true;
      }
      this.round = msg.message;

      this.canVote = this.checkCanVote();
      if (this.isVoting() && !game_init)
        this.selectedTab = 2;
      else if (this.selectedTab == 2) this.selectedTab = 1;

    });

    this.socketService.syncMessages("died").subscribe(msg => {
      console.log("User Died");
      let died: UserModel = msg.message;
      for (let i = 0; i < this.players.length; i++)
        if (this.players[i].name == died.name) {
          if (this.players[i].role == "hidden" && died.dead == 'night') died.role = "hidden";
          console.log("User died: " + died.name + " " + died.role);
          this.players[i] = died;
          if (died.name == this.username) this.dead = true;
        }

    });
    this.socketService.syncMessages("detective_findings").subscribe(msg => {
      if (this.role == "Detective") {
        console.log("Detective action");
        for (let i = 0; i < this.players.length; i++)
          if (this.players[i].name == msg.message.name) this.players[i] = msg.message;
      }
    });

    this.socketService.syncMessages("gameEnded").subscribe(msg => {
      this.gameEnded = true;
      console.log("Game ended won: " + msg.message)
      if ((msg.message == 'Mafia' && this.isMafia(this.role)) ||
        (msg.message == 'Town' && !this.isMafia(this.role)))
        this.won = true;
      else
        this.won = false;

    });
  }

  isMafia(role: string) {
    return role == "Mafioso" || role == "Barman" || role == "Godfather";
  }

  public async RetriveInfoonReload() {
    console.log("Retrieving info on Reload");
    // this.suspects = null;
    this.initialized = false;
    this.initializePlayers().then(() => {
    });
    // FIXME: need to check if this player has voted to init hasvoted var
    this.canVote = this.checkCanVote();
    this.initialized = true;
    if (this.isVoting())
      this.selectedTab = 2;
    else if (this.selectedTab == 2) this.selectedTab = 1;
  }

  public submitVote(suspects_name: string) { //called from subcomponent
    console.log("Submiting vote to " + suspects_name);
    this.selectedTab = 2;
    this.selectedTab = 1;
    this.canVote = false;
    let from = this.username, to = suspects_name;
    this.votingService.vote(from, to).toPromise();
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
        return this.isMafia(other_role) ? other_role : "hidden";
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
    if (this.dead) return false;
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
        return this.role == 'Detective';
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
