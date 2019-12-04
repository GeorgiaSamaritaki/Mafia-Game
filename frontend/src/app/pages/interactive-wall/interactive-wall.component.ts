import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ami-fullstack-interactive-wall',
  templateUrl: './interactive-wall.component.html',
  styleUrls: ['./interactive-wall.component.scss']
})
export class InteractiveWallComponent implements OnInit {

  phase_counter: number;
  constructor() {
    this.phase_counter = 0;
  }

  nextPhase(){
    if(this.phase_counter == 0){
      this.phase_counter++;
    }
  }

  ngOnInit() {
  }

}
