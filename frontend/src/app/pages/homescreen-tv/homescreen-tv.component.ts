import { Component, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SocketsService, UsersService, StateMachineService } from 'src/app/global/services';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
@Component({
  selector: 'ami-fullstack-homescreen-tv',
  templateUrl: './homescreen-tv.component.html',
  styleUrls: ['./homescreen-tv.component.scss'],

})
export class HomescreenTvComponent implements OnInit {
  public playersjoined: number;
  sub: Subscription = new Subscription;

  constructor(
    private socketService: SocketsService,
    private router: Router,
    private userService: UsersService,
    private statemachineService: StateMachineService
  ) { }

  async ngOnInit() {
    this.playersjoined = <number>(await this.userService.joinedPlayers().toPromise());

    this.sub.add(
      this.socketService.syncMessages("roundChange").subscribe(msg => {
        if (msg.message != 'Waiting') {
          this.router.navigate(['/smart-tv']);
          this.sub.unsubscribe();
          console.log('unsubscribed');
        }
      })
    )

    this.sub.add(
      this.socketService.syncMessages("playerJoined").subscribe(msg => {
        this.playersjoined++;
      })
    )
  }
  async manualChange() {
    await this.statemachineService.changeRound().toPromise();
  }

}
