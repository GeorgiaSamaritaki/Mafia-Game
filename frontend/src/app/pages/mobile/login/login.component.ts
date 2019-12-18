import { Component, OnInit } from '@angular/core';
import { UsersService, SocketsService, StateMachineService } from 'src/app/global/services';
import { UserModel } from 'src/app/global/models';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ami-fullstack-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public selectedavatarindex: number;
  public myUserID; //FIXME: this doesnt need to exist
  round: string;
  position: number;
  public socketEvents: { event: string, message: any }[]; //FIXME: this doesnt need to exist

  constructor(private statemachineService: StateMachineService,
    private socketService: SocketsService,
    private usersService: UsersService,
    private router: Router,
    private activatedRoute: ActivatedRoute 
  ) {
    this.socketEvents = [];
    this.activatedRoute.queryParams.subscribe(params => { this.position = params['position']; });
    console.log("Position " + this.position);
  }

  async ngOnInit() {
    this.myUserID = localStorage.getItem("username");
    if (this.myUserID != null && await this.usernameExists(this.myUserID)) this.goHome();
    this.round = <string>await this.statemachineService.getRound().toPromise();
    console.log(this.round);
    this.selectedavatarindex = 0;
    console.log("loading user");
    await this.usersService.loadingUser(this.position).toPromise(); 
  }

  goHome() {
    this.router.navigate(['/mobile/mainpage']);
  }

  public treated(message) {
    console.log("treated");
  }

  selectedavatar(index: number) {
    this.selectedavatarindex = index;
  }
  async usernameExists(username: string) {
    return await this.usersService.checkUsername(username).toPromise();
  }

  async addUser() {
    if (this.round == null) { //a game has started and you're not logged in
      (<HTMLElement>document.getElementById("alert")).innerHTML = "{internal error: Events were not received properly}";
      return;
    }
    if (this.round != "Waiting") { //a game has started and you're not logged in
      (<HTMLElement>document.getElementById("alert")).innerHTML = "Game is in Session";
      return;
    }

    (<HTMLElement>document.getElementById("alert")).innerHTML = "";
    this.myUserID = (<HTMLInputElement>document.getElementById("inputname")).value;
    if (this.myUserID == "") {

      (<HTMLElement>document.getElementById("alert")).innerHTML = "Empty Username";
    }
    else if (await this.usernameExists(this.myUserID)) {
      (<HTMLElement>document.getElementById("alert")).innerHTML = "Username already taken";
    } else {

      var index = 1 + this.selectedavatarindex;
      console.log(this.position);
      console.log(
        await this.usersService.addUser(
          this.myUserID, //username
          "", //role
          "player" + index + ".png", //path
          this.position, //position
          "alive" //dead
        ).toPromise()
      );
      localStorage.setItem("username", this.myUserID);
      this.goHome();
    }
  }

}
