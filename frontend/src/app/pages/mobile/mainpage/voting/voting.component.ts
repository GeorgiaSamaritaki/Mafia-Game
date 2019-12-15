import { Component, OnInit, Optional, Input } from '@angular/core';
import { UserModel } from 'src/app/global/models';
import { MainpageComponent } from '../mainpage.component';
import { ThrowStmt } from '@angular/compiler';
import { SocketsService, VotingService } from 'src/app/global/services';

@Component({
  selector: 'ami-fullstack-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.scss']
})
export class VotingComponent implements OnInit {
  selectedavatarindex: number;
  suspects: UserModel[];
  constructor(@Optional() private parent: MainpageComponent,
    private socketService: SocketsService,
    private votingService: VotingService,
  ) { }

  selectedavatar(index: number) {

    if (!this.parent.voted) this.selectedavatarindex = index;
  }

  submitVote() {
    this.parent.submitVote(this.suspects[this.selectedavatarindex].name);
    this.selectedavatarindex = 0;
  }

  async ngOnInit() {
    await this.parent.ngOnInit;

    this.selectedavatarindex = 0;

    this.socketService.syncMessages("suspects").subscribe(msg => {
      //youcan vote yourself always
      console.log("Voting: suspects Received");
      console.log(msg.message);
      this.suspects = msg.message;
    });

    if (this.parent.round != "Waiting") {
      this.RetriveInfoonReload();
    }
  }

  public async RetriveInfoonReload() {
    console.log("Retrieving info on Reload");
    this.suspects = null;
    await this.votingService.getSuspects().toPromise().then((e) => this.suspects = e);
    console.log(this.suspects);
  }


}