import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VoteModel } from '../../models';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';

@Injectable({
    providedIn: 'root'
})   
export class VotingService {

    private hostURl: string;

    constructor(private http: HttpClient) {
      this.hostURl = environment.host;
    }

    // .post('/vote', this.vote)
    // .post('/playerVotes', this.calculateVotesOfPlayer)
    // .post('/votesOfRound', this.votesOfRound)
    // .post('/addToHistory', this.addToHistory);

    public vote(from: string, to: string): Observable<VoteModel> {
      return this.http
        .post<VoteModel>(`${this.hostURl}/api/votes/vote`, {from, to})
        .pipe(map(result => new VoteModel(result)));
    }

    public getPlayerVotes(name: string) {
      return this.http
        .post(`${this.hostURl}/api/votes/playerVotes`, {name});
    }

    public votesOfRound(round: string) {
        return this.http
            .post(`${this.hostURl}/api/votes/votesOfRound`, {round});
    }

    public addToHistory(day: string, dead: string){
        return this.http
            .post(`${this.hostURl}/api/votes/addToHistory`, {day, dead});
    }
}
