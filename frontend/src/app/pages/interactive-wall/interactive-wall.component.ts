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
  playersJoined: boolean = false;
  lap: number = 0;
  phases_num: number = 0;
  phases_num_array: number[] = [];
  dead_player: string;
  backgroundColor: string = '#E74C3C';;
  background_icon: string = "background_icon_day";
  round_histroy: string[] = [];
  voters_pngs: Map<string, Array<string>> = new Map();
  suspects_pngs: string[] = [];
  phases: string[] = [];
  voted_players: Map<string, Array<string>> = new Map();
  responses: Map<string, string> = new Map([
    ['Waiting', ''],
    ['Open Ballot', 'The sun rises in Palermo, please, open your eyes.'],
    ['Mafia Voting', 'The night falls in Palermo, please, close your eyes. It is time for the Mafia to wake, and choose their next victim.'],
    ['Secret Voting', 'It is time to vote! Please, turn to your devices.'],
    ['Doctor', 'It is time for the Doctor to wake, and choose the player they want to save.'],
    ['Detective', 'It is time for the Detective to wake, and choose whose identity they want to know.'],
    ['Barman', 'It is time for the Barman to wake, and choose whose abilities they want to cancel.']
  ]);
  margin_for_leap_up: string = "";
  timeline_margin: number = 0;

  constructor(private statemachineService: StateMachineService,
    private socketService: SocketsService,
    private _leapService: LeapService,
    private speakerService: SmartSpeakerService,
    private votingService: VotingService,
    private userService: UsersService,
    private leapService: LeapService) {
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
  swipeTimelineUp() {
    document.getElementById("timeline").classList.add("slidedown");
    console.log("Swiped Up!");
    document.getElementById("timeline").style.marginTop = "-100px";

  }
  swipeTimelineDown() {
    document.getElementById("timeline").classList.add("slideup");
    console.log("Swiped Down!");
    document.getElementById("timeline").style.marginTop = "0px";
  }
  async changeRound() {
    this.lap++;
    let tmp: any = (await this.votingService.votesOfRound('day1').toPromise());
    console.log("tmp: " + tmp);
    console.log("VOTES: " + tmp.votes);
    console.log("DEAD: " + tmp.dead);
    console.log(this.round);
    if (this.phases_num > 2) {
      this.timeline_margin += -100;
      console.log(this.timeline_margin.toString());
      document.getElementById("timeline").style.marginTop = this.timeline_margin.toString() + "px";
    }
    console.log("timeline margin: " + this.timeline_margin);
    switch (this.round) {
      case 'Open Ballot': //Open Ballot
        this.backgroundColor = '#E67E22';
        this.background_icon = "background_icon_day";
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
        if (this.phases_num == 2) {
          this.timeline_margin += -100;
          console.log(this.timeline_margin.toString());
          document.getElementById("timeline").style.marginTop = this.timeline_margin.toString() + "px";
        }
        this.dead_player = tmp.dead + "_killed.png";
        this.backgroundColor = '#34495E';
        this.background_icon = "background_icon_night";
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
    this.leapService.gestureRecognizer().subscribe(gesture => {
      if (gesture == Gestures.SWIPE_DOWN) {
        this.swipeTimelineDown();
      }
      if (gesture == Gestures.SWIPE_UP) {
        this.swipeTimelineUp();
      }
    })
    this.round = <string>await this.statemachineService.getRound().toPromise();
    this.phases_num = <number>await this.statemachineService.getCounter().toPromise();
    console.log("Round Counter: " + this.phases_num);
    this.phases_num_array.push(this.phases_num);//for day
    this.phases_num_array.push(this.phases_num);//for night
    this.round = "Open Ballot";
    console.log("Number of rounds: " + this.round_histroy);
    console.log("Round was set to: " + this.round);
    await console.log(this.votingService.votesOfRound(this.round).toPromise());

    this.socketService.syncMessages("dayCounter").subscribe(msg => {
      console.log("Day Count is Changing");
      this.phases_num = msg.message;
      this.phases_num_array.push(this.phases_num);//for day
      this.phases_num_array.push(this.phases_num);//for night
      console.log("PHASES array: " + this.phases_num_array);
    });

    this.socketService.syncMessages("roundChange").subscribe(msg => {
      console.log("Round is Changing");
      this.round = msg.message;
      this.changeRound();
    });

    this.socketService.syncMessages("selectNarrator").subscribe(msg => {
      this.playersJoined = true;
      console.log('Select a Narrator');
    });

    this._leapService.cursorRecognizer().subscribe((cursor) => {
    });


    // this.socketService.syncMessages("vote").subscribe(async msg => {
    //   if (this.round != "Open Ballot") return;
    //   console.log("Player " + msg.message.toWho + " received a vote");
    //   this.insert_votes(msg.message.toWho, msg.message.fromWho)
    // });
  }

}