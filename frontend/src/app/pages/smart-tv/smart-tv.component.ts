import { Component, OnInit } from '@angular/core';

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
  //round_counter = 0;
  count: number;
  dround = ["Open Ballot", "Secret Voting"];
  nround = ["Mafia Voting", "Doctor", "Detective", "Barman"];
  upper_icon_path: string;
  background_color: string;
  next_up_icon: string;
  round_title_path: string;

  constructor() {
    this.phase = Phase.Day;
    this.phase_title = this.dround[0];
    this.next_title = this.dround[1];
    this.round_title_path = "open-ballot";
    this.day = "Day ";
    this.count = 1;
    this.upper_icon_path = "Sun";
    this.next_up_icon = "nu_secret_voting";
    //this.round_counter++;
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
      //this.round_counter++;
    } else {//night->day
      this.phase = Phase.Day;
      this.phase_title = this.dround[0];
      this.next_title = this.dround[1];
      this.day = "Day ";
      this.upper_icon_path = "Sun";
      this.background_color = "#E67E22";
      this.round_title_path = "open-ballot";
      //this.round_counter++;
    }
  }

  changeRound() {
    if (this.phase == Phase.Day) {
      switch (this.phase_title) {
        case this.dround[0]:

          break;
        case this.dround[1]:

          break;
      }
    } else {

    }
  }

  setPhase(phase: Phase) {
    this.phase = phase;
  }

  isDay() {
    if (this.phase == Phase.Day) return true;
    else return false;
  }

  getPhase() {
    return this.phase;
  }

  ngOnInit() {

  }

}

enum Phase {
  Day,
  Night
}


