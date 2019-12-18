import { Component, OnInit } from '@angular/core';
import { UsersService, SocketsService, StateMachineService, VotingService } from 'src/app/global/services';
import { UserModel } from 'src/app/global/models';
import { Router } from '@angular/router';

@Component({
  selector: 'ami-fullstack-signin-table',
  templateUrl: './signin-table.component.html',
  styleUrls: ['./signin-table.component.scss']
})
export class SigninTableComponent implements OnInit {
  
  //For user checking
  private _bot_left: boolean = false;
  private _left: boolean = false;
  private _bot_right: boolean = false;
  private _right: boolean = false;
  private _qr0: boolean = false;
  private _qr1: boolean = false;
  private _qr2: boolean = false;
  private _qr3: boolean = false;
  private _qr4: boolean = false;
  private _qr5: boolean = false;
  private _qr6: boolean = false;
  private _gameStarted: boolean = false;


  joined_players: number = 0;
  qrs: string[];
  
  players: UserModel[];
  private left_players: UserModel[];
  private right_players: UserModel[];
  private middle_players: UserModel[];

  constructor(
    private userService: UsersService,
    private stateMachine: StateMachineService,
    private socketService: SocketsService,
    private router: Router
  ) {
    this.qrs = [];
    this.players = [];
    this.left_players = [];
    this.right_players = [];
    this.middle_players = [];
  }

  async ngOnInit() {
    this.joined_players = <number>(await this.userService.joinedPlayers().toPromise());
    console.log(this.joined_players);

    this.players = await this.userService.getAllUsers().toPromise();

    for (var i = 0; i < 7; i++) {
      this.qrs.push(`https://api.qrserver.com/v1/create-qr-code/?size=92x92&data=http://192.168.1.4:4200/mobile/login?position=${i}`)
    }
    this.socketService.syncMessages("playerJoined").subscribe(msg => {
      let newPlayer = new UserModel;
      newPlayer.name = msg.message.name;
      newPlayer.role = msg.message.role;
      newPlayer.avatar_path = msg.message.avatar_path;
      newPlayer.position = msg.message.position;
      newPlayer.dead = msg.message.dead;
      this.players.push(newPlayer);
      this.hidePhotos(msg.message.position);
      this.arrangePlayers(newPlayer);
      this.joined_players++;
    });
    this.socketService.syncMessages("loadingUser").subscribe(msg => {
      console.log("loading received" + msg.message);
      this.load(msg.message);
    });

    this.socketService.syncMessages("roundChange").subscribe(msg => {
      if (msg.message != 'Waiting') {
        this.router.navigate(['/augmented-table']);
      }
    });
  }

  public async startGame() {
    if( this.readyToPlay() ){
      await this.stateMachine.selectNarrator().toPromise(); //Starts the game
      this._gameStarted = true;
      console.log('Select narrator');
    }
    else 
      console.log('Not enough players joined');
  } 

  gameStarted(){
    return this._gameStarted; 
  }
  private load(position:number){
    this.qrs[position] = "/assets/augmented_table/signin/loading.gif"; 
  }

  private hidePhotos(position: number) {
    switch (+position) {
      case 0:
        this._left = true;
        this._qr0 = true;
        break;
      case 1:
        this._qr1 = true;
        this._bot_left = true;
        break;
        case 2:
          this._qr2 = true;
          this._bot_left = true;
        break;
      case 3:
        this._qr3 = true;
        this._bot_right = true;
        break;
      case 4:
        this._qr4 = true;
        this._bot_right = true;
        break;
      case 5:
        this._qr5 = true;
        this._bot_right = true;
        break;
      case 6:
        this._qr6 = true;
        this._right = true;
    }
  }

  private arrangePlayers(newUser: UserModel) {
    if (this.joined_players <= 7) {
      switch (+newUser.position) {
        case 0:
        case 1:
          this.left_players.push(newUser);
          break;
        case 2:
        case 3:
        case 4:
          this.middle_players.push(newUser);
          break;
        case 5:
        case 6:
          this.right_players.push(newUser);
          break;
      }
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
    this.right_players.sort(function (a, b) { return a.position - b.position });
  }

  readyToPlay() {
    return this.joined_players >= 7;
  }

  public left() {
    return this._left;
  }
  public bot_left() {
    return this._bot_left;
  }
  public right() {
    return this._right;
  }
  public bot_right() {
    return this._bot_right;
  }

  public qr0(){
    return this._qr0;
  }
  public qr1(){
    return this._qr1;
  }
  public qr2(){
    return this._qr2;
  }
  public qr3(){
    return this._qr3;
  }
  public qr4(){
    return this._qr4;
  }
  public qr5(){
    return this._qr5;
  }
  public qr6(){
    return this._qr6;
  }
}
