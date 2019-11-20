import { Component, OnInit,ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'ami-fullstack-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MainpageComponent implements OnInit {
   waitingphase:boolean;
   votingphase:boolean;

  constructor() { 
    this.votingphase = false;
    this.waitingphase = false;
  }

  ngOnInit() {
  }

  public isVoting(){
    return this.votingphase;
  }
  public isWaiting(){
    return this.waitingphase;
  }
}
