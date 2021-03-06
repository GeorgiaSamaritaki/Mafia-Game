import { Component, OnInit } from '@angular/core';
import { UsersService, StateMachineService, SocketsService } from 'src/app/global/services';
import { UserModel } from 'src/app/global/models';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ami-fullstack-augmented-table',
  templateUrl: './augmented-table.component.html',
  styleUrls: ['./augmented-table.component.scss']
})
export class AugmentedTableComponent implements OnInit {

  round: string;
  winner: boolean = false;
  private players: UserModel[];
  private left_players: UserModel[];
  private right_players: UserModel[];
  private middle_players: UserModel[];
  votesOfPlayers: Map<string, number>;
  private backgroundSVG: string;
  sub: Subscription;

  constructor(
    private usersService: UsersService,
    private statemachineService: StateMachineService,
    private socketService: SocketsService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.sub = new Subscription();

    this.votesOfPlayers = new Map<string, number>();
    this.backgroundSVG = 'backgroundDay'
    this.round = <string>await this.statemachineService.getRound().toPromise();
    console.log("Round was set to: " + this.round);
    this.changeRound();

    await this.initializePlayers();

    this.sub.add(
      this.socketService.syncMessages("roundChange").subscribe(async msg => {
        await this.timeout(500);
        console.log("Round is Changing");
        this.round = msg.message;
        console.log(this.round);
        this.changeRound();
        this.votesOfPlayers.forEach((val, key) => {
          this.votesOfPlayers.set(key, 0);
        });
        
        this.votesOfPlayers.forEach((val, key) => {
          console.log(`rc ${key}, ${val}`);
        });
      })
    )
    this.sub.add(
      this.socketService.syncMessages("vote").subscribe(async msg => {
        // await this.timeout(500);
        if (this.round != "Open Ballot") return;
        console.log("Player " + msg.message.toWho + " received a vote");
        this.votesOfPlayers.set(msg.message.toWho, this.votesOfPlayers.get(msg.message.toWho) + 1);
        this.votesOfPlayers.forEach((val, key) => {
          console.log(`v ${key}, ${val}`);
        });
      })
    )
    this.sub.add(
      this.socketService.syncMessages("died").subscribe(async msg => {
        await this.timeout(500);
        console.log(`${msg.message.name} died`);
        this.aPlayerDied(msg.message);
        // TODO: delay for the graveyard ?
      })
    )
    this.sub.add(
      this.socketService.syncMessages("gameEnded").subscribe(msg => {
        console.log(`${msg.message} won`);
        this.winner = true;
      })
    )
    this.sub.add(
      this.socketService.syncMessages("restart").subscribe(msg => {
        this.sub.unsubscribe();
        console.log('unsubscribed');
        this.ngOnInit();
      })
    )
  }

  private timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async initializePlayers() {
    this.votesOfPlayers = new Map();

    this.players = await this.usersService.getAllUsers().toPromise();
    for (let player of this.players) { console.log(player.name); this.votesOfPlayers.set(player.name, 0) };
    this.arrangePlayers();
  }

  private arrangePlayers() {
    this.left_players = [];
    this.right_players = [];
    this.middle_players = [];
    if (this.players.length <= 7) {
      this.players.forEach(player => {
        switch (+player.position) {
          case 0:
          case 1:
            this.left_players.push(player);
            break;
          case 2:
          case 3:
          case 4:
            this.middle_players.push(player);
            break;
          case 5:
          case 6:
            this.right_players.push(player);
            break;
        }
      })
    } else {
      this.players.forEach(player => {
        if (player.position < (this.players.length / 3) - 1) {
          this.left_players.push(player);
        } else if (player.position > (2 * this.players.length / 3)) {
          this.right_players.push(player);
        } else {
          this.middle_players.push(player);
        }
      });
    }
    this.left_players.sort(function (a, b) { return a.position - b.position });
    this.middle_players.sort(function (a, b) { return a.position - b.position });
    this.right_players.sort(function (a, b) { return b.position - a.position });
  }

  public isDay() {
    return (this.round === 'Open Ballot' || this.round === 'Secret Voting');
  }

  public isSelected(phase: string) {
    return phase === this.round;
  }

  public changeRound() {
    switch (this.round) {
      case 'Secret Voting':
      case 'Open Ballot':
        this.backgroundSVG = 'backgroundDay';
        break;
      case 'Doctor':
      case 'Detective':
      case 'Barman':
      case 'Mafia Voting':
        this.backgroundSVG = 'backgroundNight';
        break;
      default:
        this.router.navigate(['/signin-table']);
    }
  }

  public aPlayerDied(dead: UserModel) {
    if (dead.dead === 'night') {
      console.log('dead at night');
      dead.avatar_path = `/graveyard/Hidden.png`;
    } else {
      dead.avatar_path = `/graveyard/${dead.role}.png`;
    }
    let index = this.players.findIndex(user => user.name == dead.name);
    this.players[index] = null;
    this.players[index] = dead;
    console.log(this.players);
    this.arrangePlayers();
  }

  gameEnded() {
    return this.winner;
  }

  numberOfKnives(username: string) {
    if (this.round !== 'Open Ballot') return -1;
    else {
      return this.votesOfPlayers.get(username);
    }
  }

  isAlive(username: string) {
    let p = this.players.find((user) => user.name == username);
    return p.dead == 'alive';
  }

}