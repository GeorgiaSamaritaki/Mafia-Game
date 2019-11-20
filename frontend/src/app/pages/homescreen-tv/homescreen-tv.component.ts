import { Component, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'ami-fullstack-homescreen-tv',
  templateUrl: './homescreen-tv.component.html',
  styleUrls: ['./homescreen-tv.component.scss'],
  
})
export class HomescreenTvComponent implements OnInit {
  public playersjoined:number;

  constructor() { }

  ngOnInit() {
    this.playersjoined=0;
  }

}
