import { UserModel } from './../../global/models/users/user.model';
import { Component, OnInit } from '@angular/core';
import { UsersService, SocketsService, StateMachineService, VotingService } from 'src/app/global/services';
import { SmartSpeakerService } from 'src/app/smart-speaker.service';
import { LeapService, Gestures } from '../cursor/leap.service';
import { FocusTrap } from '@angular/cdk/a11y';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ami-fullstack-interactive-wall',
  templateUrl: './interactive-wall.component.html',
  styleUrls: ['./interactive-wall.component.scss']
})
export class InteractiveWallComponent implements OnInit {
  round: string;
  playersJoined: boolean = false;
  lap: number = 0;
  narratorClicked: boolean = false;
  phases_num: number = 0;
  phases_num_array: number[] = [];
  backgroundColor: string = '#E74C3C';
  num: number = 0;
  n: number = 0;
  background_icon: string = "background_icon_day";
  round_histroy: string[] = [];
  voters_pngs: Map<number, Array<string>> = new Map();
  suspects_pngs: Map<number, Array<string>> = new Map();
  phases: string[] = [];
  voted_players: Map<string, Array<string>> = new Map();
  expand_width: boolean = false;
  whoDied: string = "";
  saved: boolean = false;
  whoDiedPng: string = "";
  diedAtNight: UserModel = null;

  changePng: boolean[] = new Array();
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
  cursorOn: boolean = false; //virtual cursor detected
  sub: Subscription;

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

  private timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async speakerSelected() {
    if (this.narratorClicked) return;
    this.narratorClicked = true;
    this.lap++;
    console.log(this.lap);
    this.speakerService.speak('Hi! I am Smart Speaker. I will be your narrator for this game.', async () => {
      console.log('starting');
      await this.statemachineService.changeRound().toPromise();
    });
    console.log('welcome speech');
  }
  swipeTimelineUp() {
    document.getElementById("timeline").classList.add("slideInDown");
    console.log("Swiped Up!");
    document.getElementById("timeline").style.marginTop = "-100px";

  }
  swipeTimelineDown() {
    document.getElementById("timeline").classList.add("slideInUp");
    console.log("Swiped Down!");
    document.getElementById("timeline").style.marginTop = "0px";
  }

  playAudio(path) {
    let audio = new Audio();
    audio.src = path;
    audio.load();
    audio.play();
  }

  async changeRound() {
    console.log(this.suspects_pngs.get(this.num));
    console.log("Num: " + this.num);
    this.lap++;
    console.log(this.round);
    if (this.phases_num > 2) {
      this.timeline_margin += -100;
      console.log(this.timeline_margin.toString());
      document.getElementById("timeline").style.marginTop = this.timeline_margin.toString() + "px";
    }
    switch (this.round) {
      case 'Open Ballot': //Open Ballot
        await this.timeout(300);
        // this.speakerService.speak(this.responses.get(this.round));
        this.playAudio(`/assets/sounds/${this.round}.mp3`);
        let temp: any = (await this.votingService.votesOfRound("Night" + this.phases_num).toPromise());
        this.suspects_pngs.delete(this.num);
        this.suspects_pngs.set(this.num, []);
        if (!this.saved) {
          if (temp.votes != undefined) {
            console.log("DEAD: " + temp.dead);
            console.log("whoDEAD: " + this.whoDied);
            let player: UserModel = await this.userService.getUser(this.whoDied).toPromise();
            this.suspects_pngs.get(this.num).push(player.avatar_path.substring(7));
            this.changePng.push(false);
          }
          if (this.whoDied != "") {
            // await this.timeout(1500);
            // this.speakerService.speak(this.whoDied + " was killed tonight by the Mafia! They are now out of the game.");
          }
        } else {
          await this.timeout(300);
          this.speakerService.speak("Nobody died tonight. A player was saved by the doctor.");
        }
        if (this.num != 0) this.num++;
        this.backgroundColor = '#E67E22';
        this.background_icon = "background_icon_day";
        this.phases.push('Day');
        this.suspects_pngs.set(this.num, []);
        break;
        case 'Secret Voting': //Secret Voting 
        this.backgroundColor = '#E67E22';
        this.background_icon = "background_icon_day";
        await this.timeout(300);
        this.playAudio(`/assets/sounds/${this.round}.mp3`);
        // this.speakerService.speak(this.responses.get(this.round));
        break;
        case 'Mafia Voting': //Mafia Voting
        if (this.whoDied != "") {
          // let role: string = (await this.userService.getUser(this.whoDied).toPromise()).role;
          // // await this.timeout(1500);
          // this.speakerService.speak(this.whoDied + " was killed today! They were a " + role);
          this.whoDied = "";
        }
        let tmp: any = (await this.votingService.votesOfRound("Day" + this.phases_num).toPromise());
        //  tmp.votes = Object.values(tmp.votes.reduce((acc, cur) => Object.assign(acc, { [cur.fromWho]: cur }), {}))
        
        if (tmp.votes != undefined) {
          console.log("tmp: " + tmp.day);
          console.log("VOTES: " + tmp.votes);
          console.log("DEAD: " + tmp.dead);
          console.log("whoDEAD: " + this.whoDied);
          console.log("whoDEADPng: " + this.whoDiedPng);
          let player: UserModel = await this.userService.getUser(tmp.dead).toPromise();
          for (let i = 0; i < this.suspects_pngs.get(this.num).length; i++) {
            if (this.suspects_pngs.get(this.num)[i] == player.avatar_path.substring(7)) {
              this.suspects_pngs.get(this.num)[i] == player.avatar_path;
              this.changePng[i] = true;
            }
          }
        }
        this.num++;
        if (this.phases_num == 2) {
          this.timeline_margin += -150;
          console.log(this.timeline_margin.toString());
          document.getElementById("timeline").style.marginTop = this.timeline_margin.toString() + "px";
        }
        this.backgroundColor = '#34495E';
        this.background_icon = "background_icon_night";
        this.phases.push('Night');
        this.suspects_pngs.set(this.num, []);
        await this.timeout(300);
        this.playAudio(`/assets/sounds/${this.round}.mp3`);
        // this.speakerService.speak(this.responses.get(this.round));
        break;
        case 'Doctor': //Doctor 
        this.backgroundColor = '#34495E';
        this.background_icon = "background_icon_night";
        await this.timeout(300);
        this.playAudio(`/assets/sounds/${this.round}.mp3`);
        // this.speakerService.speak(this.responses.get(this.round));
        break;
        case 'Detective':  //Detective 
        this.backgroundColor = '#34495E';
        this.background_icon = "background_icon_night";
        await this.timeout(300);
        this.playAudio(`/assets/sounds/${this.round}.mp3`);
        // this.speakerService.speak(this.responses.get(this.round));
        break;
        case 'Barman': //Barman 
        this.backgroundColor = '#34495E';
        this.background_icon = "background_icon_night";
        await this.timeout(300);
        this.playAudio(`/assets/sounds/${this.round}.mp3`);
        // this.speakerService.speak(this.responses.get(this.round));
        this.phases_num++;
        this.phases_num_array.push(this.phases_num);//for day
        this.phases_num_array.push(this.phases_num);//for night
        if (this.diedAtNight != null) {
          await this.timeout(3000);
        }
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
    // console.log("suspect avatar path: " + player.avatar_path);
    if (this.suspects_pngs.get(this.num).includes(player.avatar_path, 0) == false) {
      this.suspects_pngs.get(this.num).push(player.avatar_path); //get the img paths of the suspects
      this.changePng.push(false);
    }

    // console.log("Name of voter: " + fromWho);
    if (this.round == "Mafia Voting" || this.round == "Open Ballot") {
      let voter: UserModel = await this.userService.getUser(fromWho).toPromise();
      // console.log("voter avatar path: " + voter.avatar_path);
      if (!this.voters_pngs.has(this.suspects_pngs.get(this.num).length)) this.voters_pngs.set(this.suspects_pngs.get(this.num).length, []);
      if (this.num > 0) {
        this.n += this.suspects_pngs.get(this.num - 1).length;
        this.voters_pngs.set(this.suspects_pngs.get(this.num).length + this.n, []);
      }
      this.voters_pngs.get(this.suspects_pngs.get(this.num).length + this.n).push(voter.avatar_path);

      // this.voters_pngs.set(player.avatar_path, this.voters_pngs.get(player.avatar_path));
      // console.log("voters_pngs[]: " + this.voters_pngs.get(player.avatar_path));
      if (this.voters_pngs.get(this.suspects_pngs.get(this.num).length).length > 4) this.expand_width = true;
      //console.log("suspects_pngs[]: " + this.suspects_pngs);
    }


  }

  async ngOnInit() {
    this.sub = new Subscription();
    this.leapService.gestureRecognizer().subscribe(gesture => {
      if (gesture == Gestures.SWIPE_DOWN) {
        this.swipeTimelineDown();
      }
      if (gesture == Gestures.SWIPE_UP) {
        this.swipeTimelineUp();
      }
    })
    this.round = <string>await this.statemachineService.getRound().toPromise();
    this.phases_num = 1;
    console.log("Round Counter: " + this.phases_num);
    this.phases_num_array.push(this.phases_num);//for day
    this.phases_num_array.push(this.phases_num);//for night
    this.round = "Open Ballot";
    console.log("Number of rounds: " + this.round_histroy);
    console.log("Round was set to: " + this.round);
    console.log(await this.votingService.votesOfRound(this.round).toPromise());

    this.sub.add(
      this.socketService.syncMessages("roundChange").subscribe(msg => {
        console.log("Round is Changing");
        this.round = msg.message;
        this.changeRound();
      })
    )
    this.sub.add(
      this.socketService.syncMessages("selectNarrator").subscribe(msg => {
        this.playersJoined = true;
        console.log('Select a Narrator');
      })
    )
    this.sub.add(
      this.socketService.syncMessages("gameEnded").subscribe(msg => {
        this.playersJoined = true;
        console.log('Select a Narrator');
      })
    )

    this._leapService.cursorRecognizer().subscribe((cursor) => {
      const left1: number = document.getElementById('smartSpeaker').getBoundingClientRect().left;
      const left2: number = document.getElementById('playernar').getBoundingClientRect().left;
      const top1: number = document.getElementById('smartSpeaker').getBoundingClientRect().top;
      const top2: number = document.getElementById('playernar').getBoundingClientRect().top;
      const width1: number = document.getElementById('smartSpeaker').getBoundingClientRect().width;
      const width2: number = document.getElementById('playernar').getBoundingClientRect().width;
      const height1: number = document.getElementById('smartSpeaker').getBoundingClientRect().height;
      const height2: number = document.getElementById('playernar').getBoundingClientRect().height;
      if (cursor.xPos >= left1 && cursor.xPos <= (left1 + width1) && cursor.yPos >= top1 && cursor.yPos <= (top1 + height1)) {
        document.getElementById('smartSpeaker').style.opacity = "1";
      } else {
        document.getElementById('smartSpeaker').style.opacity = "0.6";
      }
      if (cursor.xPos >= left2 && cursor.xPos <= (left2 + width2) && cursor.yPos >= top2 && cursor.yPos <= (top2 + height2)) {
        document.getElementById('playernar').style.opacity = "1";
      } else {
        document.getElementById('playernar').style.opacity = "0.6";
      }
    });
    this.sub.add(
      this.socketService.syncMessages("vote").subscribe(async msg => {
        if (this.round != "Open Ballot") return;
        console.log("Player " + msg.message.toWho + " received a vote");
        this.insert_votes(msg.message.toWho, msg.message.fromWho);
      })
    )
    this.sub.add(
      this.socketService.syncMessages("saved").subscribe(async msg => {
        console.log("A Player was saved!");
        this.saved = true;
      })
    )
    this.sub.add(
      this.socketService.syncMessages("died").subscribe(async msg => {
        console.log("User Died " + msg.message.name);
        if (this.isDay()) {
          this.whoDiedPng = msg.message.avatar_path;
          this.whoDied = msg.message.name;
          await this.votingService.addToHistory("Day" + this.phases_num, this.whoDied).toPromise();
          console.log("here!");
          await this.timeout(5500);
          this.playAudio(`/assets/sounds/${msg.message.name}Killed.mp3`);
          // this.speakerService.speak(msg.message.name + " was killed today! They were a " + msg.message.role);
        } else {
          this.diedAtNight = msg.message;
          this.whoDiedPng = msg.message.avatar_path;
          this.whoDied = msg.message.name;
          console.log("died hereeeeeeeeeeeeeeeeeeeee");
          await this.votingService.addToHistory("Night" + this.phases_num, this.whoDied).toPromise();
          await this.timeout(10500);
          this.playAudio(`/assets/sounds/${msg.message.name}Killed.mp3`);
          // this.speakerService.speak(msg.message.name + " was killed tonight by the Mafia! They are now out of the game.");
        }
      })
    )
  }
}