import { Component, OnInit, Input } from '@angular/core';
import { UsersService, SocketsService, StateMachineService, VotingService } from 'src/app/global/services';
import { UserModel } from 'src/app/global/models';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
  selector: 'ami-fullstack-smart-tv',
  templateUrl: './smart-tv.component.html',
  styleUrls: ['./smart-tv.component.scss']
})
export class SmartTvComponent implements OnInit {
  round: string;
  initialized: boolean = false;
  count: number;
  winner: string = '';
  players: UserModel[] = [];
  votesOfPlayers: Map<string, number>;
  suspects: UserModel[] = null; //can change
  shouldDie: UserModel;
  deathRevealing: number = 0;
  dead: string;
  dead_path: string;
  role_of_dead: string;
  card_of_dead: string;

  phase_title: string; // html stuff that are for some reason here
  next_title: string;
  next_up_icon: string;
  round_title_path: string;
  background_rect: string;
  sub: Subscription;

  constructor(private statemachineService: StateMachineService,
    private userService: UsersService,
    private socketService: SocketsService,
    private votingService: VotingService,
    private router: Router) {
  }

  private async initializePlayers() {
    this.votesOfPlayers = new Map();
    await this.userService.getAllUsers().toPromise().then(
      (players) => {
        this.players = players;
        this.players.forEach((user: UserModel) =>
          this.votesOfPlayers.set(user.name, 0));
      }
    );
  }

  private timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  playAudio(path) {
    let audio = new Audio();
    audio.src = path;
    audio.load();
    audio.play();
  }

  playAudioPromise(path) {
    return new Promise((resolve, reject) => {
      let audio = new Audio();
      audio.src = path;
      audio.load();
      audio.onended = resolve;
      audio.play();
    });
  }

  async revealDeath(player: UserModel) {
    this.deathRevealing = 1;
    console.log('Drumrolls trtrtrttr')
    await this.playAudioPromise('/assets/sounds/drumroll.wav');
    // await this.timeout(2000);
    this.deathRevealing = 2;
    //await this.timeout(100000000);
    await this.timeout(4000);
    this.deathRevealing = 0;
  }

  async ngOnInit() {
    this.sub = new Subscription();

    this.count = <number>await this.statemachineService.getCounter().toPromise();
    this.round = <string>await this.statemachineService.getRound().toPromise();
    console.log("Round was set to: " + this.round);
    if (this.round == "Waiting") this.router.navigate(['/homescreen-tv']);
    this.round = "Open Ballot";
    this.changeRound();

    this.initializePlayers().then(() => this.initialized = true);

    this.sub.add(
      this.socketService.syncMessages("roundChange").subscribe(async msg => {
        await this.timeout(500);
        if (this.round == "Barman") this.count++; // if last round war barman
        console.log("Round is Changing");
        this.initialized = false;
        this.round = msg.message;
        await this.changeRound();
        this.initialized = true;
      })
    )
    this.sub.add(
      this.socketService.syncMessages("vote").subscribe(async msg => {
        console.log("Player " + msg.message.toWho + " received a vote from:" + msg.message.fromWho);
        this.votesOfPlayers.set(msg.message.toWho, this.votesOfPlayers.get(msg.message.toWho) + 1);
        if (this.isDay())
          this.playAudio("/assets/sounds/knife.wav");
        await this.timeout(800);
      })
    )
    this.sub.add(
      this.socketService.syncMessages("died").subscribe(async msg => {
        console.log("User Died");
        this.aPlayerWasKilled(msg.message);
        this.dead = msg.message.name;
        console.log(msg.message.avatar_path);
        this.dead_path = msg.message.avatar_path.substring(7);
        this.role_of_dead = msg.message.role;
        if(!this.isDay()){
          await this.timeout(5000);
          this.revealDeath(msg.message);
          return;
        }
        this.revealDeath(msg.message);
        await this.timeout(800);
      })
    )
    this.sub.add(
      this.socketService.syncMessages("gameEnded").subscribe(msg => {
        console.log(`${msg.message} won`);
        this.winner = msg.message;
        this.playAudio("/assets/sounds/game-over.wav");
      })
    )
    this.sub.add(
      this.socketService.syncMessages("suspects").subscribe(async msg => {
        await this.timeout(500);
        //youcan vote yourself always
        console.log("Suspects Received");
        console.log(msg.message);
        this.suspects = msg.message;
      })
    )
    this.sub.add(
      this.socketService.syncMessages("restart").subscribe(msg => {
        this.sub.unsubscribe();
        console.log('unsubscribed');
        this.router.navigate(['/homescreen-tv']);
      })
    )
  }

  sendToEnd(name: string) {
    let from: number = -1;
    this.players.forEach((user: UserModel, index: number) => { if (user.name === name) from = index; });
    console.log("move from" + from + "to end");
    if (from == -1) return;
    let cutOut = this.players.splice(from, 1)[0]; // cut the element at index 'from'
    this.players.splice(this.players.length, 0, cutOut);
  }

  async aPlayerWasKilled(dead_player: UserModel) { //find index or name
    this.sendToEnd(dead_player.name);

    if (dead_player.dead == "day") {
    } else if (dead_player.dead == "night") {
      dead_player.role = "night";
    } else
      console.log("There was an error");

    this.players[this.players.length - 1] = dead_player;

  }

  getPlayer(player_name: string) {
    for (var user of this.players)
      if (user.name === name) return user;
  }

  getVotes(player) {
    if (typeof player === "number") {
      return this.votesOfPlayers.get(this.players[player].name);
    } else if (typeof player == "string")
      return this.votesOfPlayers.get(player);
  }

  isSuspect(username: string) {
    for (let i = 0; i < this.suspects.length; i++)
      if (this.suspects[i].name == username) return true;
    return false;
  }

  isMafiaVoting() {
    return (this.round_title_path == 'mafia-voting');
  }

  isSecretVoting() {
    return (this.round_title_path == 'secret-voting');
  }

  isOpenBallot() {
    return (this.round_title_path == 'open-ballot');
  }

  showVotes(i: number) {
    return (this.votesOfPlayers.get(this.players[i].name) > 0);
  }


  isDay() {
    return (this.round == 'Open Ballot' || this.round == 'Secret Voting');
  }

  async changeRound() {
    switch (this.round) {
      case 'Secret Voting': //Open Ballot -> Secret Voting
        this.background_rect = "sec-vot-rect-day";
        this.round_title_path = "secret-voting";
        this.phase_title = "Secret Voting";
        this.next_title = "Mafia Voting";
        this.next_up_icon = "nu_mafia";
        break;
      case 'Mafia Voting': //Secret Voting -> Mafia Voting
        this.background_rect = "tv-rectangle-night";
        this.round_title_path = "mafia-voting";
        this.phase_title = "Mafia Voting";
        this.next_title = "Doctor";
        this.next_up_icon = "nu_doctor";
        break;
      case 'Doctor': //Mafia Voting -> Doctor
        this.round_title_path = "doctor";
        this.phase_title = "Doctor";
        this.next_title = "Detective";
        this.next_up_icon = "nu_detective";
        this.background_rect = "tv-rectangle-night";
        break;
      case 'Detective': //Doctor -> Detective
        this.round_title_path = "detective";
        this.phase_title = "Detective";
        this.next_title = "Barman";
        this.next_up_icon = "nu_barman";
        this.background_rect = "tv-rectangle-night";
        break;
      case 'Barman': //Detective -> Barman
        this.round_title_path = "barman";
        this.phase_title = "Barman";
        this.next_title = "Open Ballot";
        this.next_up_icon = "nu_open_ballot";
        this.background_rect = "tv-rectangle-night";
        break;
      case 'Open Ballot': //Barman -> Open Ballot
        this.background_rect = "tv-rectangle-day";
        this.round_title_path = "open-ballot";
        this.phase_title = "Open Ballot";
        this.next_title = "Secret Voting";
        this.next_up_icon = "nu_secret_voting";
        break;
    }
    for (let player of this.players) this.votesOfPlayers.set(player.name, 0);

  }

  gameEnded() {
    return this.winner !== '';
  }

  async manualChange() {
    await this.statemachineService.changeRound().toPromise();
  }


}



