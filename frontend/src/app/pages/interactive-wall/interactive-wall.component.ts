import { Component, OnInit } from '@angular/core';
import { UsersService, SocketsService, StateMachineService, VotingService } from 'src/app/global/services';
import { SmartSpeakerService } from 'src/app/smart-speaker.service';
import { UserModel } from 'src/app/global/models';
import { LeapService, Gestures } from '../cursor/leap.service';

@Component({
  selector: 'ami-fullstack-interactive-wall',
  templateUrl: './interactive-wall.component.html',
  styleUrls: ['./interactive-wall.component.scss']
})
export class InteractiveWallComponent implements OnInit {
  round: string;
  lap: number;
  phases_num: number;
  dead_player: string;
  backgroundColor: string;
  background_icon: string;
  round_histroy: string[];
  voters_pngs: Map<string, Array<string>>;
  suspects_pngs: string[];
  phases: string[];
  voted_players: Map<string, Array<string>>;
  responses: Map<string, string>;
  constructor(private statemachineService: StateMachineService,
    private socketService: SocketsService,
    private speakerService: SmartSpeakerService,
    private votingService: VotingService,
    private userService: UsersService,
    private leapService: LeapService) {
    this.lap = 0;//this is backend
    this.phases_num = 0;
    this.backgroundColor = '#E74C3C';//TODO:this is css 
    this.background_icon = "background_icon_day";//TODO:this is css 
    this.round_histroy = [];
    this.phases = [];
    this.suspects_pngs = [];
    this.voters_pngs = new Map();
    this.voted_players = new Map();
    this.responses = new Map([
      ['Waiting', ''],
      ['Open Ballot', 'The sun rises in Palermo, please, open your eyes.'],
      ['Mafia Voting', 'The night falls in Palermo, please, close your eyes. It is time for the Mafia to wake, and choose their next victim.'],
      ['Secret Voting', 'It is time to vote! Please, turn to your devices.'],
      ['Doctor', 'It is time for the Doctor to wake, and choose the player they want to save.'],
      ['Detective', 'It is time for the Detective to wake, and choose whose identity they want to know.'],
      ['Barman', 'It is time for the Barman to wake, and choose whose abilities they want to cancel.']
    ]);
    this.speakerService.addCommand('What day is it', () => {
      this.speakerService.speak('It is Day' + this.phases_num);
    });
    this.speakerService.addCommand('On which round are we', () => {
      this.speakerService.speak('We are on round ' + this.round);
    });
    this.speakerService.addCommand('Repeat', () => {
      this.speakerService.speak(this.responses[this.round]);
    });
  }

  isDay() {
    return (this.round == 'Open Ballot' || this.round == 'Secret Voting');
  }

  speakerSelected() {
    this.lap++;
    console.log(this.lap);
    this.speakerService.speak('Hi! I am Smart Speaker. I will be your narrator for this game.');
    console.log('welcome speech');
  }
  swipeWrapperUp(){

  }
  async changeRound() {
    this.lap++;
    let tmp: any = (await this.votingService.votesOfRound('day1').toPromise());
    console.log(tmp);
    console.log(tmp.votes);
    console.log(tmp.dead);
    console.log(this.round);
    switch (this.round) {
      case 'Open Ballot': //Open Ballot
        this.backgroundColor = '#E67E22';
        this.background_icon = "background_icon_day";
        this.phases_num++;
        this.phases.push('Day');
        await this.insert_votes('Maria', 'Kiki').then((e) => console.log("!!!KIKI voted maria"));
        await this.insert_votes('Maria', 'Manolis').then((e) => console.log("!!!Manolis voted maria"));
        await this.insert_votes('Maria', 'Kosmas').then((e) => console.log("!!!Kosmas voted maria"));
        await this.insert_votes('George', 'Renata').then((e) => console.log("!!!George voted Renata"));
        await this.speakerService.speak(this.responses.get(this.round));
        break;
      case 'Secret Voting': //Secret Voting 
        this.backgroundColor = '#E67E22';
        this.background_icon = "background_icon_day";
        this.speakerService.speak(this.responses.get(this.round));
        break;
      case 'Mafia Voting': //Mafia Voting
        this.dead_player = tmp.dead + "_killed.png";
        this.backgroundColor = '#34495E';
        this.background_icon = "background_icon_night";
        this.phases_num++;
        this.phases.push('Night');
        this.speakerService.speak(this.responses.get(this.round));
        break;
      case 'Doctor': //Doctor 
        this.backgroundColor = '#34495E';
        this.background_icon = "background_icon_night";
        this.speakerService.speak(this.responses.get(this.round));
        break;
      case 'Detective':  //Detective 
        this.backgroundColor = '#34495E';
        this.background_icon = "background_icon_night";
        this.speakerService.speak(this.responses.get(this.round));
        break;
      case 'Barman': //Barman 
        this.backgroundColor = '#34495E';
        this.background_icon = "background_icon_night";
        this.speakerService.speak(this.responses.get(this.round));
        break;
    }
    this.round_histroy.push(this.round);
    console.log("Round was set to: " + this.round);
    console.log("Number of rounds: " + this.round_histroy);
    return;
  }

  async insert_votes(toWho: string, fromWho: string) {
    if (!this.voted_players.has(toWho)) this.voted_players.set(toWho, []);
    this.voted_players.get(toWho).push(fromWho);

    let player: UserModel = await this.userService.getUser(toWho).toPromise();
    console.log("suspect avatar path: " + player.avatar_path);

    if (this.suspects_pngs.includes(player.avatar_path, 0) == false) this.suspects_pngs.push(player.avatar_path); //get the img paths of the suspects

    console.log("Name of voter: " + fromWho);
    let voter: UserModel = await this.userService.getUser(fromWho).toPromise();
    console.log("voter avatar path: " + voter.avatar_path);
    if (!this.voters_pngs.has(player.avatar_path)) this.voters_pngs.set(player.avatar_path, []);
    this.voters_pngs.get(player.avatar_path).push(voter.avatar_path);


    // this.voters_pngs.set(player.avatar_path, this.voters_pngs.get(player.avatar_path));
    console.log("voters_pngs[]: " + this.voters_pngs.get(player.avatar_path));
    console.log("suspects_pngs[]: " + this.suspects_pngs);
  }


  async ngOnInit() {
    this.leapService.gestureRecognizer().subscribe(gesture =>{
      if(gesture==Gestures.SWIPE_DOWN){
        this.swipeWrapperUp()
      }
    })
    this.round = <string>await this.statemachineService.getRound().toPromise();
    this.round = "Open Ballot";
    console.log("Number of rounds: " + this.round_histroy);
    console.log("Round was set to: " + this.round);
    await console.log(this.votingService.votesOfRound(this.round).toPromise());
    
    this.socketService.syncMessages("roundChange").subscribe(msg => {
      console.log("Round is Changing");
      this.round = msg.message;
      this.changeRound();
    });

    // this.socketService.syncMessages("vote").subscribe(async msg => {
    //   if (this.round != "Open Ballot") return;
    //   console.log("Player " + msg.message.toWho + " received a vote");
    //   this.insert_votes(msg.message.toWho, msg.message.fromWho)
    // });
  }

}