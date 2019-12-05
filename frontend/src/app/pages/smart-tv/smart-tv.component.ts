import { Component, OnInit, Input } from '@angular/core';
import { UsersService } from 'src/app/global/services';
import { UserModel } from 'src/app/global/models';

@Component({
  selector: 'ami-fullstack-smart-tv',
  templateUrl: './smart-tv.component.html',
  styleUrls: ['./smart-tv.component.scss']
})
export class SmartTvComponent implements OnInit {

  private phase: Phase = Phase.Day;
  phase_title: string;
  next_title: string;
  day: string;
  count: number;
  dround = ["Open Ballot", "Secret Voting"];
  nround = ["Mafia Voting", "Doctor", "Detective", "Barman"];
  next_up_icon: string;
  round_title_path: string;
  background_rect: string;
  players: UserModel[] = [];
  votesOfPlayers: Map<string, number>;
  // = [{ name: "Alice", votes: 0 }, { name: "George", votes: 2 }, { name: "Maria", votes: 4 }, { name: "Kiki", votes: 0 },
  // { name: "Manolis", votes: 0 }, { name: "Kosmas", votes: 0 }, { name: "Renata", votes: 1 }];
  suspects_indexes: number[] = [1, 2]; //can change
  index_of_killed: number;
  shouldDie: UserModel;
  deaths: string[];
  dead_indexes: number[] = [];
  @Input() player_count: number;

  constructor(private userService: UsersService) {
    this.phase = Phase.Day;
    this.phase_title = this.dround[0];
    this.next_title = this.dround[1];
    this.round_title_path = "open-ballot";
    this.day = "Day ";
    this.count = 1;
    this.next_up_icon = "nu_secret_voting";
    this.background_rect = "tv-rectangle-day";
    this.votesOfPlayers = new Map();
  }

  private async initializePlayers() {
    this.players = await this.userService.getAllUsers().toPromise();
    console.log("Initialize Players0:"); console.log(this.players);
    for (let player of this.players) this.votesOfPlayers.set(player.name, 0);
    console.log("Initialize Players1:"); console.log(this.votesOfPlayers);
    this.deaths = [];
    this.player_count = this.players.length;

    await this.userService.changePathOfUser(
      "Maria", "player3.png").toPromise();
    await this.userService.changePathOfUser(
      "Alice", "player1.png").toPromise();
    this.votesOfPlayers.set("George", 2);
    this.votesOfPlayers.set("Maria", 4);
    this.votesOfPlayers.set("Renata", 1);
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
    // this.suspect_count = this.player_count - 2;
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

  changePhase() {
    if (this.phase == Phase.Day) {//day->night
      this.phase = Phase.Night;
      this.phase_title = this.nround[0];
      this.next_title = this.nround[1];
      this.day = "Night ";
      this.next_up_icon = "nu_doctor";
      this.round_title_path = "mafia-voting";
      this.count++;
      this.background_rect = "tv-rectangle-night";
    } else {//night->day
      this.phase = Phase.Day;
      this.phase_title = this.dround[0];
      this.next_title = this.dround[1];
      this.day = "Day ";
      this.round_title_path = "open-ballot";
      this.background_rect = "tv-rectangle-day";
      this.next_up_icon = "nu_secret_voting";
      //this.round_counter++;
    }
  }

  async changeRound() {
    if (this.phase == Phase.Day) {
      switch (this.phase_title) {
        case this.dround[0]: //Open Ballot -> Secret Voting
          this.background_rect = "sec-vot-rect-day";
          this.round_title_path = "secret-voting";
          this.phase_title = this.dround[1];
          this.next_title = this.nround[0];
          this.next_up_icon = "nu_mafia";
          this.whoShouldDie(); //counts votes and gets player in the middle
          break;
        case this.dround[1]: //Secret Voting -> Mafia Voting
          this.changePhase();
          await this.aPlayerWasKilled(); //this needs an index to be know or a name
          break;
      }
    } else {
      switch (this.phase_title) {
        case this.nround[0]: //Mafia Voting -> Doctor
          this.background_rect = "sec-vot-rect-day";
          this.round_title_path = "doctor";
          this.phase_title = this.nround[1];
          this.next_title = this.nround[2];
          this.next_up_icon = "nu_detective";
          this.background_rect = "tv-rectangle-night";
          break;
        case this.nround[1]: //Doctor -> Detective
          this.background_rect = "sec-vot-rect-day";
          this.round_title_path = "detective";
          this.phase_title = this.nround[2];
          this.next_title = this.nround[3];
          this.next_up_icon = "nu_barman";
          this.background_rect = "tv-rectangle-night";
          break;
        case this.nround[2]: //Detective -> Barman
          this.background_rect = "sec-vot-rect-day";
          this.round_title_path = "barman";
          this.phase_title = this.nround[3];
          this.next_title = this.dround[0];
          this.next_up_icon = "nu_open_ballot";
          this.background_rect = "tv-rectangle-night";
          break;
        case this.nround[3]: //Barman -> Open Ballot
          this.changePhase();
          // await this.aPlayerWasKilled();
          break;
      }
    }
  }

  isDay() {
    if (this.phase == Phase.Day) return true;
    else return false;
  }


  showVotes(i: number) {
    if (this.votesOfPlayers.get(this.players[i].name) > 0) {
      return true;
    } else {
      return false;
    }
  }

  async ngOnInit() {
    await this.initializePlayers();
    // this.assign_roles();
  }

}

enum Phase {
  Day,
  Night
}


