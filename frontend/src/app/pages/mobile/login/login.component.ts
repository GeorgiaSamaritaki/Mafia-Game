import { Component, OnInit } from '@angular/core';
import { UsersService, SocketsService } from 'src/app/global/services';
import { UserModel } from 'src/app/global/models';
import { StateMachineService } from 'src/app/global/services';
import { Router } from '@angular/router';

@Component({
  selector: 'ami-fullstack-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public selectedavatarindex: number;
  public myUserID;
  public userIDToTreat;
  public foodToTreat;
  public socketEvents: { event: string, message: any }[];

  constructor(private statemachineService: StateMachineService,
    private socketService: SocketsService,
    private usersService: UsersService,
    private router: Router
  ) {
    this.socketEvents = [];
  }

  async isWaiting() {
    console.log("ok");
    return (await this.statemachineService.getPhase().toPromise() === "Waiting");
  }

  ngOnInit() {
    this.myUserID = localStorage.getItem("username");
    console.log("User id: "+this.myUserID);
    // if (this.myUserID != null) this.goHome();

    this.selectedavatarindex = 0;
    if (!this.isWaiting()) this.goHome();

    this.userIDToTreat = "trix";
    this.socketService.syncMessages("treating").subscribe(msg => {
      if (msg.message.userID == this.myUserID) {
        this.treated(msg.message.food);
        this.socketEvents.push(msg);
      }
    });
  }

  public treatsb() {
    this.myUserID = (<HTMLInputElement>document.getElementById("inputname")).value;
    this.foodToTreat = "i treat you this from " + this.myUserID;
    this.statemachineService.treatsb(this.foodToTreat, this.userIDToTreat).subscribe();
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
    (<HTMLElement>document.getElementById("alert")).innerHTML = "";
    this.myUserID = (<HTMLInputElement>document.getElementById("inputname")).value;
    if (this.myUserID == "") {

      (<HTMLElement>document.getElementById("alert")).innerHTML = "Empty Username";
    }
    else if (await this.usernameExists(this.myUserID)) {
      (<HTMLElement>document.getElementById("alert")).innerHTML = "Username already taken";
    } else {

      var index = 1 + this.selectedavatarindex;
      console.log(
        await this.usersService.addUser(
          this.myUserID,
          ""
          , "player" + index + ".png"
        ).toPromise()
      );
      localStorage.setItem("username", this.myUserID);
      this.goHome();

    }
  }
}
