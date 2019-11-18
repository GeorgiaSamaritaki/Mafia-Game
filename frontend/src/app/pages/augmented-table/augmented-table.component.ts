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
  private phase_title: string;
  private day: string;
  private count: number;
  private dround = ["Open Ballot", "Secret Voting"];
  private nround = ["Mafia Voting", "Doctor", "Detective", "Barman"];
  private players: UserModel[];
  private backgroundSVG: string;

  constructor(
    private usersService: UsersService
    ) { 
    this.phase = Phase.Day;
    this.phase_title = this.dround[0];
    this.day = "Day ";
    this.count = 1;
    this.backgroundSVG = "backgroundDay"
  }

  async ngOnInit() {
    await this.getPlayers();
    console.log(this.players);
  }
  
  private async getPlayers() {
    this.players = await this.usersService.getAllUsers().toPromise();
  }

  public isDay() {
    return this.phase == Phase.Day;
  }
}

enum Phase{
  Day,
  Night
}