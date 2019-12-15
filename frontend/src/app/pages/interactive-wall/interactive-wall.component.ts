import { Component, OnInit } from '@angular/core';
import { UsersService, SocketsService, StateMachineService, VotingService } from 'src/app/global/services';
import { SmartSpeakerService } from 'src/app/smart-speaker.service';
import { LeapService } from 'src/app/cursor/leap.service';

@Component({
  selector: 'ami-fullstack-interactive-wall',
  templateUrl: './interactive-wall.component.html',
  styleUrls: ['./interactive-wall.component.scss']
})
export class InteractiveWallComponent implements OnInit {
  round: string;
  playersJoined: boolean = false;
  lap: number;
  phases_num: number;
  backgroundColor: string;
  background_icon: string;
  round_histroy: string[];
  phases: string[];
  responses: Map<string, string>;
  constructor(private statemachineService: StateMachineService,
    private socketService: SocketsService,
    private _leapService: LeapService,
    private speakerService: SmartSpeakerService,
    private votingService: VotingService) {
    this.lap = 0;//this is backend
    this.phases_num = 0;
    this.backgroundColor = '#E74C3C';//TODO:this is css 
    this.background_icon = "background_icon_day";//TODO:this is css 
    this.round_histroy = [];
    this.phases = [];
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

  async speakerSelected() {
    this.lap++;
    console.log(this.lap);
    this.speakerService.speak('Hi! I am Smart Speaker. I will be your narrator for this game.', async () => {
      console.log('starting');
      await this.statemachineService.changeRound().toPromise();
    });
    console.log('welcome speech');
  }

  async changeRound() {
    this.lap++;
    console.log(this.round);
    switch (this.round) {
      case 'Open Ballot': //Open Ballot
        this.backgroundColor = '#E67E22';
        this.background_icon = "background_icon_day";
        this.phases_num++;
        this.phases.push('Day');
        this.speakerService.speak(this.responses.get(this.round));
        break;
      case 'Secret Voting': //Secret Voting 
        this.backgroundColor = '#E67E22';
        this.background_icon = "background_icon_day";
        this.speakerService.speak(this.responses.get(this.round));
        break;
      case 'Mafia Voting': //Mafia Voting
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

  async ngOnInit() {
    this.round = <string>await this.statemachineService.getRound().toPromise();
    this.round = "Open Ballot";
    console.log("Number of rounds: " + this.round_histroy);
    console.log("Round was set to: " + this.round);
    console.log(await this.votingService.votesOfRound(this.round).toPromise());

    this.socketService.syncMessages("roundChange").subscribe(msg => {
      console.log("Round is Changing");
      this.round = msg.message;
      this.changeRound();
    });

    this.socketService.syncMessages("selectNarrator").subscribe(msg => {
      this.playersJoined = true;
      console.log('Select a Narrator');
    });

    this._leapService.cursorRecognizer().subscribe((cursor)=>{
    });

  }

}