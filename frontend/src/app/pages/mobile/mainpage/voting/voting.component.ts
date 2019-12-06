import { Component, OnInit, Optional } from '@angular/core';
import { UserModel } from 'src/app/global/models';
import { UsersService } from 'src/app/global/services';
import { MainpageComponent } from '../mainpage.component';

@Component({
  selector: 'ami-fullstack-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.scss']
})
export class VotingComponent implements OnInit {
  suspects: UserModel[];
  selectedavatarindex: number;
  constructor( @Optional() private parent: MainpageComponent) { }

  selectedavatar(index: number) {
    this.selectedavatarindex = index;
  }
  
  submitVote() { //FIXME: submitvote(from, to)
    // return true;
  }

  async ngOnInit() {
    await this.parent.ngOnInit;
    this.selectedavatarindex = 0;

    // this.unlockVoting();
  }

}
