import { Component, OnInit, Input, Optional } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';

import { UserModel } from 'src/app/global/models';
import { MainpageComponent } from '../mainpage.component';

@Component({
  selector: 'ami-fullstack-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public flips: boolean[] = [];


  public toggleflip(index: number) {
    this.flips[index] = !this.flips[index];
  }
  public flipall() {
    let tmp: boolean = this.flips.filter(current => current).length != 0 ? false : true;
    tmp = true;
    this.flips.forEach((item, index) => { this.flips[index] = tmp; });
  }

  constructor(
    @Optional() private parent: MainpageComponent) {
  }

  async ngOnInit() {
    await this.parent.ngOnInit;
    console.log("ok")
    this.parent.players.forEach((item, index) => {
      this.flips[index] = false;
    });;
  }
  getpath(path: string) {
    if (path.startsWith("killed_")) return path;
    return "mobile_" + path;

  }

}
