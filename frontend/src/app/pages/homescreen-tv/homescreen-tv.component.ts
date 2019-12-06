import { Component, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SocketsService } from 'src/app/global/services';
import { Router } from '@angular/router';
@Component({
  selector: 'ami-fullstack-homescreen-tv',
  templateUrl: './homescreen-tv.component.html',
  styleUrls: ['./homescreen-tv.component.scss'],

})
export class HomescreenTvComponent implements OnInit {
  public playersjoined: number;
  public socketEvents: { event: string, message: any }[];

  constructor(private socketService: SocketsService,
    private router: Router) { }

  ngOnInit() {
    this.playersjoined = 0; //FIXME:

    this.socketService.syncMessages("roundChange").subscribe(msg => {
      if (msg.message != 'Waiting') {
        this.router.navigate(['/smart-tv']);
      }
    });
  }

}
