import { Component, OnInit, Optional } from '@angular/core';
import { UserModel } from 'src/app/global/models';
import { MainpageComponent } from '../mainpage.component';

@Component({
  selector: 'ami-fullstack-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.scss']
})
export class VotingComponent implements OnInit {
  selectedavatarindex: number;
  constructor( @Optional() private parent: MainpageComponent) { }

  selectedavatar(index: number) {
    if(!this.parent.voted) this.selectedavatarindex = index;
  }

  submitVote(){
    this.parent.submitVote(this.selectedavatarindex);
  }
  
  async ngOnInit() {
    await this.parent.ngOnInit;
    this.selectedavatarindex = 0;
  }

}
