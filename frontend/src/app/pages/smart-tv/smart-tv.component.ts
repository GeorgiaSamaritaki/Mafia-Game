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
  suspects_indexes: number[] = [1, 2]; //can change
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
    this.players = await this.userService.getAllUsers().toPromise();
    for (let player of this.players) this.votesOfPlayers.set(player.name, 0);
    this.deaths = [];

  }

  async ngOnInit() {
    this.count = 1;
    this.round = <string>await this.statemachineService.getRound().toPromise();
    console.log("Round was set to: " + this.round);
    // if (this.round == "Waiting") this.router.navigate(['/homescreen-tv']); //FIXME: this needs to be active
    this.round = "Open Ballot";
    this.changeRound();

    this.initializePlayers().then(() => this.initialized = true);

    this.socketService.syncMessages("roundChange").subscribe(async msg => {
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

    // await this.votingService.findSuspects().toPromise();
  }

  array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  };

  sendToEnd(name: string) {
    let from: number = -1;
    this.players.forEach((user: UserModel, index: number) => { if (user.name === name) from = index; });
    console.log("move from" + from + "to end");
    if (from == -1) return;
    let cutOut = this.players.splice(from, 1)[0]; // cut the element at index 'from'
    this.players.splice(this.players.length, 0, cutOut);
  }

  async aPlayerWasKilled() { //find index or name
    var playertokil = this.players[this.suspects_indexes[0]];
    this.deaths.push(playertokil.name);
    this.sendToEnd(playertokil.name);
    this.players[this.players.length - 1] = await this.userService.changePathOfUser(
      playertokil.name, "killed_" + playertokil.avatar_path).toPromise();
    this.players[this.players.length - 1].role = "night"; //check if we can show the card or not
    for (let player of this.players) this.votesOfPlayers.set(player.name, 0);
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


  whoShouldDie() { //get suspects in the middle TODO: maybe some with same votes and we have more
    var max: number = -Infinity, max1: number = max, player_name: string, player_name1: string;
    this.votesOfPlayers.forEach((votes: number, name: string) => {
      if (max1 < votes) {
        if (max < votes) {
          max1 = max;
          player_name1 = player_name;
          max = votes;
          player_name = name;
        } else {
          max1 = votes;
          player_name1 = name;
        }
      }
    });
    console.log("WhoshouldDie-> player: " + player_name + " player2:" + player_name1);
    this.suspects_indexes[0] = -1;
    this.suspects_indexes[1] = -1;
    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i].name == player_name) this.suspects_indexes[0] = i;
      if (this.players[i].name == player_name1) this.suspects_indexes[1] = i;
    }
    this.votesOfPlayers.set(player_name, 0);
    this.votesOfPlayers.set(player_name1, 0);
  }

  isSuspect(i: number) {
    if (i == this.suspects_indexes[0] || i == this.suspects_indexes[1]) return true;
    return false;
  }


  isDead(i: number) {
    for (var player_name of this.deaths)
      if (this.players[i].name == player_name) return true;

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
        this.whoShouldDie(); //FIXME:counts votes and gets player in the middle
        break;
      case 'Mafia Voting': //Secret Voting -> Mafia Voting
        this.background_rect = "tv-rectangle-night";
        this.round_title_path = "mafia-voting";
        this.phase_title = "Mafia Voting";
        this.next_title = "Doctor";
        this.next_up_icon = "nu_doctor";
        await this.aPlayerWasKilled(); //FIXME: backend
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

  }

  async manualChange() {
    //FIXME: manual change with no need
    // switch (this.round) {
    //   case 'Secret Voting': //Open Ballot -> Secret Voting
    //     this.round = 'Mafia Voting';
    //     break;
    //   case 'Mafia Voting': //Secret Voting -> Mafia Voting
    //     this.round = 'Doctor';
    //     break;
    //   case 'Doctor': //Mafia Voting -> Doctor
    //     this.round = 'Detective';
    //     break;
    //   case 'Detective': //Doctor -> Detective
    //     this.round = 'Barman';
    //     break;
    //   case 'Barman': //Detective -> Barman
    //     this.round = 'Open Ballot';
    //     break;
    //   case 'Open Ballot': //Barman -> Open Ballot
    //     this.round = 'Secret Voting';
    //     break;
    // }
    // this.changeRound();
    await this.statemachineService.changeRound().toPromise();
  }


}



