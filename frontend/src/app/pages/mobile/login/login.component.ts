import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ami-fullstack-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public selectedavatarindex:number;
  constructor() { }

  ngOnInit() {
    this.selectedavatarindex = 0;
  }
  selectedavatar(index:number){
    this.selectedavatarindex = index;
  }
  getuser(){
    return [(<HTMLInputElement>document.getElementById("inputname")).value,
            this.selectedavatar]; 
  }
}
