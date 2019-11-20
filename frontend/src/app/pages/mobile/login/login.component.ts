import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/global/services';
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

  async addUser() {
    console.log(
      await this.usersService.addUser(
        (<HTMLInputElement>document.getElementById("inputname")).value,
        ""
        , "player" + this.selectedavatarindex + ".png"
      ).toPromise()

    );

  }
}
