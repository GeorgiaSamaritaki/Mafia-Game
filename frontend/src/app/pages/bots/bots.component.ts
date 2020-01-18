import { Component, OnInit } from '@angular/core';
import { StateMachineService, UsersService } from 'src/app/global/services';

@Component({
  selector: 'ami-fullstack-bots',
  templateUrl: './bots.component.html',
  styleUrls: ['./bots.component.scss']
})
export class BotsComponent implements OnInit {

  constructor(
    private statemachineService: StateMachineService,
    private usersService: UsersService 
  ) { }

  async ngOnInit() {
    if (await this.usersService.botify().toPromise()) {
      console.log('Bots added');
    }
    
  }

  public async restart() {
    console.log('restart')
    await this.statemachineService.restartGame().toPromise();
  }

  public async start() {
    await this.statemachineService.changeRound().toPromise();
  }
}
