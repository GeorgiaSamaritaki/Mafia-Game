import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/global/services';
import { UserModel } from 'src/app/global/models';

@Component({
  selector: 'ami-fullstack-augmented-table',
  templateUrl: './augmented-table.component.html',
  styleUrls: ['./augmented-table.component.scss']
})
export class AugmentedTableComponent implements OnInit {

  private phase: Phase = Phase.Day;
  phase_title: string;
  private day: string;
  private count: number;
  private dround = ['Open Ballot', 'Secret Voting'];
  private nround = ['Mafia Voting', 'Doctor', 'Detective', 'Barman'];
  private players: UserModel[];
  private backgroundSVG: string;

  constructor(
    private usersService: UsersService
  ) {
    this.phase = Phase.Day;
    this.phase_title = this.dround[0];
    this.day = 'Day ';
    this.count = 1;
    this.backgroundSVG = 'backgroundDay'
  }

  async ngOnInit() {
    await this.getPlayers();
  }

  private async getPlayers() {
    this.players = await this.usersService.getAllUsers().toPromise(); 
  }

  public isDay() {
    return this.phase == Phase.Day;
  }

  public isSelected(phase: string) {
    return phase === this.phase_title;
  }

  public changeRound() {
    switch (this.phase_title) {
      case 'Open Ballot':
        this.phase_title = 'Secret Voting';
        break;
      case 'Secret Voting':
        this.phase_title = 'Mafia Voting';
        this.phase = Phase.Night;
        this.backgroundSVG = 'backgroundNight';
        break;
      case 'Mafia Voting':
        this.phase_title = 'Doctor';
        break;
      case 'Doctor':
        this.phase_title = 'Detective';
        break;
      case 'Detective':
        this.phase_title = 'Barman';
        break;
      case 'Barman':
        this.phase_title = 'Open Ballot';
        this.phase = Phase.Day;
        this.backgroundSVG = 'backgroundDay';
        break;
      default:
        console.log('Something went very wrong');
    }
  }

}

enum Phase {
  Day,
  Night
}