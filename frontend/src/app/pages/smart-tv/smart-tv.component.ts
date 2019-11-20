import { Component, OnInit } from '@angular/core';
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
  upper_icon_path: string;
  background_color: string;
  next_up_icon: string;
  round_title_path: string;
  background_rect: string;
  players: UserModel[];
  votesOfPlayers = [{ name: "Alice", votes: 0 }, { name: "George", votes: 2 }, { name: "Maria", votes: 4 }, { name: "Kiki", votes: 0 },
  { name: "Manolis", votes: 0 }, { name: "Kosmas", votes: 0 }, { name: "Renata", votes: 1 }];
  suspects_indexes: number[] = [1, 2]; //can change
  index_of_killed: number;
  shouldDie: UserModel;
  deaths: number = 0;
  dead_indexes: number[] = [];

  constructor(private userService: UsersService) {
    this.phase = Phase.Day;
    this.phase_title = this.dround[0];
    this.next_title = this.dround[1];
    this.round_title_path = "open-ballot";
    this.day = "Day ";
    this.count = 1;
    this.upper_icon_path = "Sun";
    this.next_up_icon = "nu_secret_voting";
    this.background_rect = "tv-rectangle-day";
  }

  private async initializePlayers() {
    this.players = await this.userService.getAllUsers().toPromise();
    this.players[2] = await this.userService.changePathOfUser("Maria", "player3.png").toPromise();
    this.players[1] = await this.userService.changePathOfUser("George", "player2.png").toPromise();
    this.players[6] = await this.userService.changePathOfUser("Renata", "player7.png").toPromise();
    console.log(this.players);
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

  async aPlayerWasKilled() {
    
    console.log("index"+this.index_of_killed);
    console.log(this.votesOfPlayers);
    console.log(this.players);
    this.players[this.index_of_killed] = await this.userService.changePathOfUser(this.votesOfPlayers[this.index_of_killed].name, "killed_player" +  this.deaths + ".png").toPromise();
    
  }

  changePhase() {
    if (this.phase == Phase.Day) {//day->night
      this.phase = Phase.Night;
      this.phase_title = this.nround[0];
      this.next_title = this.nround[1];
      this.day = "Night ";
      this.upper_icon_path = "moon";
      this.background_color = "#34495E";
      this.next_up_icon = "nu_doctor";
      this.round_title_path = "mafia-voting";
      this.count++;
      this.background_rect = "tv-rectangle-night";
    } else {//night->day
      this.phase = Phase.Day;
      this.phase_title = this.dround[0];
      this.next_title = this.dround[1];
      this.day = "Day ";
      this.upper_icon_path = "Sun";
      this.background_color = "#E67E22";
      this.round_title_path = "open-ballot";
      this.background_rect = "tv-rectangle-day";
      this.next_up_icon = "nu_secret_voting";
      //this.round_counter++;
    }
  }

  whoShouldDie() {
    this.deaths++;
    var max: number = -Infinity, key: number;

    this.votesOfPlayers.forEach(function (v, k) { //find the index of player who should die
      if (max < +v.votes) {
        max = +v.votes;
        key = k;
      }
    });
    console.log("key "+key);
    this.shouldDie = this.players[key];
    this.array_move(this.votesOfPlayers, key, 6); //make the player go last
    this.array_move(this.players, key, 6); //a player is killed
    this.index_of_killed = 6;
    if (this.deaths == 1) {
      this.dead_indexes.push(this.index_of_killed);
    }
    else {
      this.dead_indexes.push(this.index_of_killed - 1);
    }
    this.votesOfPlayers[this.index_of_killed].votes = 0
    console.log(this.shouldDie);
    console.log(this.players);
    console.log(this.index_of_killed);
  }

  isSuspect(i: number) {
    if (i == this.suspects_indexes[0] || i == this.suspects_indexes[1]) return true;
    return false;
  }

  isDead(i: number) {
    for (var j: number = 0; j < this.dead_indexes.length; j++) {
      if (i == this.dead_indexes[j]) return true;
    }
    return false;
  }

  isMafiaVoting() {
    return (this.round_title_path == 'mafia-voting');
  }

  isSecretVoting() {
    return (this.round_title_path == 'secret-voting');
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
          break;
        case this.dround[1]: //Secret Voting -> Mafia Voting
          this.changePhase();
          this.whoShouldDie();
          await this.aPlayerWasKilled();
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
          break;
      }
    }
  }

  isDay() {
    if (this.phase == Phase.Day) return true;
    else return false;
  }

  getPhase() {
    return this.phase;
  }

  async ngOnInit() {
    await this.initializePlayers();
  }

}

enum Phase {
  Day,
  Night
}


