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

    public getPhase() {
      return this.http
        .get(`${this.hostURl}/api/stateMchine/getPhase`);
    }
    
    public getRound() {
      return this.http
        .get(`${this.hostURl}/api/stateMachine/getRound`);
    }
    
    public changePhase() {
      return this.http
        .get(`${this.hostURl}/api/stateMachine/changePhase`);
    }

    public changeRound() {
      return this.http
        .get(`${this.hostURl}/api/stateMachine/changeRound`);
    }

    public isDay() {
      return this.http
        .get(`${this.hostURl}/api/stateMachine/isDay`);
    }
}
