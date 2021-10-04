import { Component, OnInit } from '@angular/core';
import { StateMachineService, UsersService, SocketsService, VotingService } from 'src/app/global/services';
import { Subscription } from 'rxjs';
import { UserModel, VoteModel } from 'src/app/global/models';

var dayVotes: VoteModel[][] = [
  [
    {
      fromWho: 'Alice',
      toWho: 'George',
      round: ''
    },
    {
      fromWho: 'Maria',
      toWho: 'George',
      round: ''
    },
    {
      fromWho: 'George',
      toWho: 'Maria',
      round: ''
    },
    {
      fromWho: 'Kiki',
      toWho: 'Maria',
      round: ''
    },
    {
      fromWho: 'Manolis',
      toWho: 'Maria',
      round: ''
    },
    {
      fromWho: 'Renata',
      toWho: 'Kiki',
      round: ''
    },
  ],
  [
    {
      fromWho: 'Alice',
      toWho: 'George',
      round: ''
    },
    {
      fromWho: 'George',
      toWho: 'Alice',
      round: ''
    },
    {
      fromWho: 'Manolis',
      toWho: 'Alice',
      round: ''
    },
    {
      fromWho: 'Renata',
      toWho: 'George',
      round: ''
    },
  ]
]

@Component({
  selector: 'ami-fullstack-bots',
  templateUrl: './bots.component.html',
  styleUrls: ['./bots.component.scss']
})
export class BotsComponent implements OnInit {

  bots: UserModel[] = [];
  sub: Subscription;

  constructor(
    private statemachineService: StateMachineService,
    private socketService: SocketsService,
    private usersService: UsersService,
    private stateMachine: StateMachineService,
    private votingService: VotingService
  ) { }

  async ngOnInit() {
    this.sub = new Subscription();

    this.sub.add(
      this.socketService.syncMessages("bots").subscribe(msg => {
        this.bots = [...msg.message];
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

  public async restart() {
    console.log('restart')
    await this.statemachineService.restartGame().toPromise();
  }

  public async start() {
    await this.statemachineService.changeRound().toPromise();
  }

  public async addBots() {
    if (await this.usersService.botify().toPromise()) {
      console.log('Bots added');
    }
    console.log(this.bots);
  }

  private timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  public async voteAll() {
    let tmpVotes: VoteModel[];
    let counter = await this.stateMachine.getCounter().toPromise();
    console.log(`Round ${counter}`)
    if ( counter == 1)
      tmpVotes = dayVotes[0];
    else
      tmpVotes = dayVotes[1];

    tmpVotes.forEach(async vote => {
      await this.timeout(300);
      await this.votingService.vote(vote.fromWho, vote.toWho).toPromise();
      console.log(`${vote.fromWho} voted: ${vote.toWho}`);
    })
  }

  public async mafiaVote() {
    let barman: UserModel;
    let masonB: UserModel;
    this.bots.forEach(bot => {
      switch (bot.role) {
        case 'Barman':
          barman = bot;
          break;
        case 'Mason':
          masonB = bot;
          break;
      }
    })
    await this.votingService.vote(barman.name, masonB.name).toPromise();
    console.log(`${barman.name} voted: ${masonB.name}`);
  }

  public async doctorVote() {
    let doctor: UserModel;
    let civilian: UserModel;
    this.bots.forEach(bot => {
      switch (bot.role) {
        case 'Doctor':
          doctor = bot;
          break;
        case 'Civilian':
          civilian = bot;
          break;
      }
    })
    await this.votingService.vote(doctor.name, civilian.name).toPromise();
    console.log(`${doctor.name} voted: ${civilian.name}`);
  }

  public async barmanVote() {
    let barman: UserModel;
    let civilian: UserModel;
    this.bots.forEach(bot => {
      switch (bot.role) {
        case 'Barman':
          barman = bot;
          break;
        case 'Civilian':
          civilian = bot;
          break;
      }
    })
    await this.votingService.vote(barman.name, civilian.name).toPromise();
    console.log(`${barman.name} voted: ${civilian.name}`);
  }
}
