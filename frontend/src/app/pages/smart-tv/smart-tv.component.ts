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
    console.log(this.players);
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

  changeRound() {
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


