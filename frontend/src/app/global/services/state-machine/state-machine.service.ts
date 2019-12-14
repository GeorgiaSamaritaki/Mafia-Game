import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class StateMachineService {

  private hostURl: string;

  constructor(private http: HttpClient) {
    this.hostURl = environment.host;
  }

  public getRound() {
    return this.http
      .get(`${this.hostURl}/api/stateMachine/getRound`);
  }

  public changeRound() {
    console.log('eee');
    return this.http
      .get(`${this.hostURl}/api/stateMachine/changeRound`);
  }

  public selectNarrator() {
    return this.http
      .get(`${this.hostURl}/api/stateMachine/selectNarrator`);
  }

  public treatsb(foodToTreat, toUserID) {
    return this.http
      .post(`${this.hostURl}/api/stateMachine/treatsb`,
        {
          message: {
            food: foodToTreat,
            userID: toUserID
          },
          event: "treating"
        }
      );
  }

}
