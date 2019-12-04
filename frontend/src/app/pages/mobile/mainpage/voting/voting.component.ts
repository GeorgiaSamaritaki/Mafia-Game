import { Component, OnInit } from '@angular/core';
import { UserModel } from 'src/app/global/models';
import { UsersService } from 'src/app/global/services';

@Component({
  selector: 'ami-fullstack-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.scss']
})
export class VotingComponent implements OnInit {
  suspects: UserModel[];
  selectedavatarindex: number;
  constructor(private userService: UsersService) { }

  public async unlockVoting() {
    this.suspects = await this.userService.getAllUsers().toPromise();
  }
  selectedavatar(index: number) {
    this.selectedavatarindex = index;
  }
  isOpenBallot() {
    return false;
  }
  isMafiaVoting() {
    return false;
  }
  isSecretVoting() {
    return true;
  }
  submitVote() {
    // return true;
  }

  ngOnInit() {
    this.selectedavatarindex = 0;

    this.unlockVoting();
  }

}
