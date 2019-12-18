import { Component, OnInit, Input, Optional } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { UserModel } from 'src/app/global/models';
import { MainpageComponent } from '../mainpage.component';
import { htmlAstToRender3Ast } from '@angular/compiler/src/render3/r3_template_transform';

// import {DragDropModule} from '@angular/cdk/drag-drop';
@Component({
  selector: 'ami-fullstack-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public flips: boolean[] = [];

  cardinit: boolean = false;
  role: string;
  accomplices: UserModel[] = [];

  card_open: boolean = false;
  descriptions: Map<string, string> = new Map([
    ['Mafioso', 'A Mafioso is a member of the Mafia who has no special abilities.'],
    ['Godfather', 'A Godfather is a member of the Mafia who will be identified as an innocent by the detectives.'],
    ['Barman', 'A Barman is a member of the Mafia who may anonymously cancel the effect of another role\'s ability every night.'],
    ['Detective', 'A Detective is an innocent who has the abilty to learn one player’s alignment every night.'],
    ['Doctor', 'A Doctor is an innocent who has the ability to save one player every night.'],
    ['Mason', 'Masons are town-aligned players who can recognize each other.'],
    ['Civilian', 'A Civilian is an innocent who has no extraordinary abilities.']
  ]);

  public toggleflip(index: number) {
    this.flips[index] = !this.flips[index];
  }

  public flipall() {
    let tmp: boolean = this.flips.filter(current => current).length != 0 ? false : true;
    this.flips.forEach((item, index) => { this.flips[index] = tmp; });
  }
  public toggleCard() {
    this.card_open = !this.card_open;
    if (this.card_open) {
      this.addAnimation('move_down');
    } else {
      this.addAnimation('move_up');
    }
  }
 
  constructor(
    @Optional() private parent: MainpageComponent) {
  }
  async ngOnInit() {
    await this.parent.ngOnInit
    this.initCard();
  }
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isMafia(role: String) {
    return role == 'Mafioso' || role == 'Barman' || role == 'Godfather';
  }

  async initCard() {
    while (this.parent.players.length == 0) await this.delay(500); //this is dangeroyw

    this.parent.players.forEach((item, index) => {
      this.flips[index] = false;
    });;

    if (this.parent.role == "Mason" || this.isMafia(this.parent.role))
      this.parent.players.forEach(
        (user: UserModel) => {
          if (user.name != this.parent.username) {
            if (this.isMafia(this.parent.role) && this.isMafia(user.role)) this.accomplices.push(user);
            if (this.parent.role == "Mason" && user.role == "Mason") this.accomplices.push(user);
          }
        }
      )

    this.cardinit = true;
  }

  getpath(path: string) {
    if (path.startsWith("killed_")) return path;
    return "mobile_" + path;

  }

  public async addAnimation(move) {
    document.getElementById('popcard').classList.add(move);
    await this.delay(500);
    document.getElementById('popcard').classList.remove(move);
  }
}
