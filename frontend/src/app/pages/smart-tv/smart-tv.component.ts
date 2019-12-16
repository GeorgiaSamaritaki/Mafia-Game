import { Component, OnInit, Input } from '@angular/core';
import { UsersService, SocketsService, StateMachineService, VotingService } from 'src/app/global/services';
import { UserModel } from 'src/app/global/models';
import { Router } from '@angular/router';


@Component({
  selector: 'ami-fullstack-smart-tv',
  templateUrl: './smart-tv.component.html',
  styleUrls: ['./smart-tv.component.scss']
})
export class SmartTvComponent implements OnInit {
  round: string;
  initialized: boolean = false;
  phase_title: string;
  next_title: string;
  day: string;
  count: number;

  next_up_icon: string;
  round_title_path: string;
  background_rect: string;
  players: UserModel[] = [];
  votesOfPlayers: Map<string, number>;
  suspects: UserModel[] = null; //can change
  index_of_killed: number;
  shouldDie: UserModel;
  deaths: string[];
  dead_indexes: number[] = [];
  @Input() player_count: number;
  suspect_count: number;

  constructor(private statemachineService: StateMachineService,
    private userService: UsersService,
    private socketService: SocketsService,
    private votingService: VotingService,
    private router: Router) {
  }

  private async initializePlayers() {
    this.votesOfPlayers = new Map();
    await this.userService.getAllUsers().toPromise().then(
      (players) => {
        this.players = players;
        for (let i = 0, j = this.players.length; j >= 0; i++ , j--) {
          this.votesOfPlayers.set(this.players[i].name, 0);
          if (this.players[i].dead != "alive") {
            console.log("sending to end" + this.players[i].name);
            this.sendToEnd(this.players[i].name);
            i = -1;
          }
        }
        console.log(this.players);
      }
    );
    this.deaths = [];
  }

  async ngOnInit() {
    this.count = 1;
    this.round = <string>await this.statemachineService.getRound().toPromise();
    console.log("Round was set to: " + this.round);
    if (this.round == "Waiting") this.router.navigate(['/homescreen-tv']); //FIXME: this needs to be active
    this.round = "Open Ballot";
    this.changeRound();

    this.initializePlayers().then(() => this.initialized = true);

    this.socketService.syncMessages("roundChange").subscribe(async msg => {
      if (this.round == "Barman") this.count++; // if last round war barman
      console.log("Round is Changing");
      this.initialized = false;
      this.round = msg.message;
      await this.changeRound();
      this.initialized = true;
    });

    this.socketService.syncMessages("vote").subscribe(async msg => {
      console.log("Player " + msg.message.toWho + " received a vote from:" + msg.message.fromWho);
      this.votesOfPlayers.set(msg.message.toWho, this.votesOfPlayers.get(msg.message.toWho) + 1);
    });

    this.socketService.syncMessages("died").subscribe(async msg => {
      console.log("User Died");
      this.aPlayerWasKilled(msg.message);
    });

    this.socketService.syncMessages("suspects").subscribe(msg => {
      //youcan vote yourself always
      console.log("Suspects Received");
      console.log(msg.message);
      this.suspects = msg.message;
    });
  }

  sendToEnd(name: string) {
    let from: number = -1;
    this.players.forEach((user: UserModel, index: number) => { if (user.name === name) from = index; });
    console.log("move from" + from + "to end");
    if (from == -1) return;
    let cutOut = this.players.splice(from, 1)[0]; // cut the element at index 'from'
    this.players.splice(this.players.length, 0, cutOut);
  }

  async aPlayerWasKilled(dead_player: UserModel) { //find index or name
    this.deaths.push(dead_player.name);
    this.sendToEnd(dead_player.name);

    if (dead_player.dead == "day") {
    } else if (dead_player.dead == "night") {
      dead_player.role = "night";
    } else
      console.log("There was an error");

    this.players[this.players.length - 1] = dead_player;

  }

  getPlayer(player_name: string) {
    for (var user of this.players)
      if (user.name === name) return user;
  }

  getVotes(player) {
    if (typeof player === "number") {
      return this.votesOfPlayers.get(this.players[player].name);
    } else if (typeof player == "string")
      return this.votesOfPlayers.get(player);
  }

  isSuspect(username: string) {
    for (let i = 0; i < this.suspects.length; i++)
      if (this.suspects[i].name == username) return true;
    return false;
  }

  isMafiaVoting() {
    return (this.round_title_path == 'mafia-voting');
  }

  isSecretVoting() {
    return (this.round_title_path == 'secret-voting');
  }

  isOpenBallot() {
    return (this.round_title_path == 'open-ballot');
  }

  showVotes(i: number) {
    return (this.votesOfPlayers.get(this.players[i].name) > 0);
  }


  isDay() {
    return (this.round == 'Open Ballot' || this.round == 'Secret Voting');
  }

  async changeRound() {
    switch (this.round) {
      case 'Secret Voting': //Open Ballot -> Secret Voting
        this.background_rect = "sec-vot-rect-day";
        this.round_title_path = "secret-voting";
        this.phase_title = "Secret Voting";
        this.next_title = "Mafia Voting";
        this.next_up_icon = "nu_mafia";
        break;
      case 'Mafia Voting': //Secret Voting -> Mafia Voting
        this.background_rect = "tv-rectangle-night";
        this.round_title_path = "mafia-voting";
        this.phase_title = "Mafia Voting";
        this.next_title = "Doctor";
        this.next_up_icon = "nu_doctor";
        this.count++;
        break;
      case 'Doctor': //Mafia Voting -> Doctor
        this.round_title_path = "doctor";
        this.phase_title = "Doctor";
        this.next_title = "Detective";
        this.next_up_icon = "nu_detective";
        this.background_rect = "tv-rectangle-night";
        break;
      case 'Detective': //Doctor -> Detective
        this.round_title_path = "detective";
        this.phase_title = "Detective";
        this.next_title = "Barman";
        this.next_up_icon = "nu_barman";
        this.background_rect = "tv-rectangle-night";
        break;
      case 'Barman': //Detective -> Barman
        this.round_title_path = "barman";
        this.phase_title = "Barman";
        this.next_title = "Open Ballot";
        this.next_up_icon = "nu_open_ballot";
        this.background_rect = "tv-rectangle-night";
        break;
      case 'Open Ballot': //Barman -> Open Ballot
        this.background_rect = "tv-rectangle-day";
        this.round_title_path = "open-ballot";
        this.phase_title = "Open Ballot";
        this.next_title = "Secret Voting";
        this.next_up_icon = "nu_secret_voting";
        break;
    }
    for (let player of this.players) this.votesOfPlayers.set(player.name, 0);

  }

  async manualChange() {
    await this.statemachineService.changeRound().toPromise();
  }


}



