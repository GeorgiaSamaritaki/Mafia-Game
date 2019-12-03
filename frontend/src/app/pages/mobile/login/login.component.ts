import { Component, OnInit } from '@angular/core';
import { UsersService, SocketsService } from 'src/app/global/services';
import { UserModel } from 'src/app/global/models';

@Component({
  selector: 'ami-fullstack-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public selectedavatarindex: number;
  constructor(
    private usersService: UsersService
  ) { }

  ngOnInit() {
    this.selectedavatarindex = 0;
  }
  selectedavatar(index: number) {
    this.selectedavatarindex = index;
  }
  async usernameExists(username: string) {
    return await this.usersService.checkUsername(username).toPromise();
  }
  async addUser() {
    var username: string = (<HTMLInputElement>document.getElementById("inputname")).value;
    if (username == "" || await this.usernameExists(username)) {
      alert("Username Invalid");
      return;
    }
    console.log(
      await this.usersService.addUser(
        username,
        ""
        , "player" + this.selectedavatarindex + ".png"
      ).toPromise()
    );

    // if (sessionStorage.getItem('username'))
    //   console.log(sessionStorage.getItem('username'));
    // else {
    //   console.log('New session');
    //   sessionStorage.setItem('username', username);
    // }

  }
}
