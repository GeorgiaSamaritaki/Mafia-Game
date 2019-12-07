import { Component, OnInit } from '@angular/core';
import { UsersService, SocketsService, StateMachineService } from 'src/app/global/services';
import { SmartSpeakerService } from 'src/app/smart-speaker.service';

@Component({
  selector: 'ami-fullstack-interactive-wall',
  templateUrl: './interactive-wall.component.html',
  styleUrls: ['./interactive-wall.component.scss']
})
export class InteractiveWallComponent implements OnInit {
  round: string;
  lap: number;
  phases_num: number;
  backgroundColor: string;
  background_icon: string;
  round_histroy: string[];
  phases: string[];
  constructor(private statemachineService: StateMachineService,
    private socketService: SocketsService,
    private speakerService: SmartSpeakerService) {
    this.lap = 0;
    this.phases_num = 0;
    this.backgroundColor = '#E74C3C';
    this.background_icon = "day";
    this.round_histroy = [];
    this.phases = [];
    this.speakerService.addCommand('What day is it', () => {
      this.speakerService.speak('It is Day' + this.phases_num);
    });
    this.speakerService.addCommand('On which round are we', () => {
      this.speakerService.speak('We are on round ' + this.round);
    });
  }

  nextPhase() {
    console.log(this.lap);
    if (this.lap > 1) {
      if (this.isDay()) {
        this.backgroundColor = '#E67E22';
        this.background_icon = "background_icon_day";
      } else {
        this.backgroundColor = '#34495E';
        this.background_icon = "background_icon_night";
      }
    }
  }

  isDay() {
    return (this.round == 'Open Ballot' || this.round == 'Secret Voting');
  }

  manualChange() { //async
    this.lap++;
    console.log("Laps: " + this.lap);
    if (this.lap == 1) {
      this.speakerService.speak('Hi! I am Smart Speaker. I will be your narrator for this game.');
      console.log('welcome speech');
    }
    if (this.lap == 2) {
      this.round = 'Open Ballot';
      console.log("Round was set to: " + this.round);
      this.round_histroy.push(this.round);
      console.log("Number of rounds: " + this.round_histroy);
      this.nextPhase();
      this.phases_num++;
      this.phases.push('Day');
      this.speakerService.speak('The sun rises in Palermo, please, open your eyes.');
      return;
    }
    switch (this.round) {
      case 'Secret Voting': //Open Ballot -> Secret Voting
        this.round = 'Mafia Voting';
        this.nextPhase();
        this.phases_num++;
        this.phases.push('Night');
        this.speakerService.speak('The night falls in Palermo, please, close your eyes.');
        this.speakerService.speak('It is time for the Mafia to wake, and choose their next victim.');
        break;
      case 'Mafia Voting': //Secret Voting -> Mafia Voting
        this.round = 'Doctor';
        this.speakerService.speak('It is time for the Doctor to wake, and choose the player they want to save.');
        break;
      case 'Doctor': //Mafia Voting -> Doctor
        this.round = 'Detective';
        this.speakerService.speak('It is time for the Detective to wake, and choose whose identity they want to know.');
        break;
      case 'Detective': //Doctor -> Detective
        this.round = 'Barman';
        this.speakerService.speak('It is time for the Barman to wake, and choose whose abilities they want to cancel.');
        break;
      case 'Barman': //Detective -> Barman
        this.round = 'Open Ballot';
        this.nextPhase();
        this.phases_num++;
        this.phases.push('Day');
        this.speakerService.speak('The sun rises in Palermo, please, open your eyes.');
        break;
      case 'Open Ballot': //Barman -> Open Ballot
        this.round = 'Secret Voting';
        this.speakerService.speak('It is time to vote! Please, turn to your devices.');
        break;
    }
    this.round_histroy.push(this.round);
    console.log("Round was set to: " + this.round);
    console.log("Number of rounds: " + this.round_histroy);
    return;
    // this.changeRound();
  }

  // changeRound() { //async

  //   switch (this.round) {
  //     case 'Secret Voting': //Open Ballot -> Secret Voting

  //       break;
  //     case 'Mafia Voting': //Secret Voting -> Mafia Voting

  //       break;
  //     case 'Doctor': //Mafia Voting -> Doctor

  //       break;
  //     case 'Detective': //Doctor -> Detective

  //       break;
  //     case 'Barman': //Detective -> Barman

  //       break;
  //     case 'Open Ballot': //Barman -> Open Ballot

  //       break;
  //   }
  //   // this.round_counter++;
  // }

  ngOnInit() { //async
    // this.round = <string>await this.statemachineService.getPhase().toPromise();
    // this.round = "Open Ballot";
    // console.log("Number of rounds: " + this.round_histroy);
    // console.log("Round was set to: " + this.round);

    // this.socketService.syncMessages("roundChange").subscribe(msg => {
    //   console.log("Round is Changing");
    //   this.round = msg.message;
    //   this.changeRound();
    // });
  }

}