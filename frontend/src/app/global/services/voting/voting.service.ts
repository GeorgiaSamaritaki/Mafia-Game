import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';
import { UserModel, VoteModel } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class VotingService {

  private hostURl: string;

  constructor(private http: HttpClient) {
    this.hostURl = environment.host;
  }

  public vote(from: string, to: string): Observable<VoteModel> {
    return this.http
      .post<VoteModel>(`${this.hostURl}/api/votes/vote`, { from, to });
  }

  public getPlayerVotes(name: string) {
    return this.http
      .post(`${this.hostURl}/api/votes/playerVotes`, { name });
  }

  public votesOfRound(round: string) {
    return this.http
      .post(`${this.hostURl}/api/votes/votesOfRound`, { round });
  }

  public addToHistory(day: string, dead: string) {
    return this.http
      .post(`${this.hostURl}/api/votes/addToHistory`, { day, dead });
  }

  public getVoters(name: string) {
    return this.http
      .post(`${this.hostURl}/api/votes/getVoters`, { name });
  }

  public getSuspects(): Observable<UserModel[]> {
    return this.http
      .get<UserModel[]>(`${this.hostURl}/api/votes/getSuspects`)
      .pipe(map(result => _.map(result, (t) => new UserModel(t))));
  }
}

