import { Component, OnInit } from '@angular/core';
import { UsersService, StateMachineService, SocketsService } from 'src/app/global/services';
import { UserModel } from 'src/app/global/models';

@Component({
  selector: 'ami-fullstack-augmented-table',
  templateUrl: './augmented-table.component.html',
  styleUrls: ['./augmented-table.component.scss']
})
export class AugmentedTableComponent implements OnInit {

  round: string;
  private players: UserModel[];
  private left_players: UserModel[];
  private right_players: UserModel[];
  private middle_players: UserModel[];
  private backgroundSVG: string;

  constructor(
    private usersService: UsersService,
    private statemachineService: StateMachineService,
    private socketService: SocketsService
  ) {
    this.backgroundSVG = 'backgroundDay'
  }

  async ngOnInit() {
    await this.initializePlayers();

    this.round = <string>await this.statemachineService.getRound().toPromise();
    console.log("Round was set to: " + this.round);
    this.round = "Open Ballot";
    console.log("Round was set to: " + this.round);
    this.changeRound();

    this.socketService.syncMessages("roundChange").subscribe(msg => {
      console.log("Round is Changing");
      this.round = msg.message;
      this.changeRound();
    });
  }

  private async initializePlayers() {
    this.players = await this.usersService.getAllUsers().toPromise();
    this.arrangePlayers();
  }

  private arrangePlayers() {
    this.left_players = [];
    this.right_players = [];
    this.middle_players = [];

    this.players.forEach(player => {
      if ( player.position < (this.players.length / 3)-1) {
        this.left_players.push(player);
      } else if ( player.position > (2*this.players.length/3)) {
        this.right_players.push(player);
      } else {
        this.middle_players.push(player);
      }
    });
    this.left_players.sort(function(a,b){return a.position - b.position } );
    this.middle_players.sort(function(a,b){return a.position - b.position } );
    this.right_players.sort(function(a,b){return a.position - b.position } );
  }

  public isDay() {
    return (this.round === 'Open Ballot' || this.round === 'Secret Voting');
  }

  public isSelected(phase: string) {
    return phase === this.round;
  }

  public changeRound() {
    switch (this.round) {
      case 'Open Ballot':
        this.round = 'Open Ballot';
        this.backgroundSVG = 'backgroundDay';
        break;
      case 'Secret Voting':
        this.round = 'Secret Voting';
        break;
      case 'Mafia Voting':
        this.round = 'Mafia Voting';
        this.backgroundSVG = 'backgroundNight';
        break;
      case 'Doctor':
        this.round = 'Doctor';
        break;
      case 'Detective':
        this.round = 'Detective';
        break;
      case 'Barman':
        this.round = 'Barman';
        break;
      default:
        console.log('Something went very wrong');
    }
  }

}