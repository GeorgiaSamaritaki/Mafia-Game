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
  count: number;
  dround = ["Open Ballot", "Secret Voting"];
  nround = ["Mafia Voting", "Doctor", "Detective", "Barman"];
  upper_icon_path: string;

  constructor() { 
      this.phase = Phase.Day;
      this.phase_title = this.dround[0];
      this.next_title = this.dround[1];
      this.day = "Day ";
      this.count = 1;
      this.upper_icon_path = "Sun";
    
  }

  changePhase(phase: Phase){
    if(phase == Phase.Day){
      this.phase = Phase.Night;
      this.phase_title = this.nround[0];
      this.next_title = this.nround[1];
      this.day = "Night ";
      this.count = 1;
      this.upper_icon_path = "moon"
    }else{
      this.phase_title = this.dround[0];
      this.next_title = this.dround[1];
      this.day = "Day ";
      this.count = 1;
      this.upper_icon_path = "Sun";
    }
  }
  
  setPhase(phase: Phase){
    this.phase = phase;
  }

  isDay(){
    if(this.phase == Phase.Day) return true;
    else return false;
  }

  getPhase(){
    return this.phase;
  }

  ngOnInit() {
    
  }

}

enum Phase{
  Day,
  Night
}


