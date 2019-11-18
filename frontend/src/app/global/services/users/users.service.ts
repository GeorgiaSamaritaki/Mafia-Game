import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserModel } from '../../models';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class UsersService {

    private hostURl: string;

    constructor(private http: HttpClient) {
      this.hostURl = environment.host;
    }

    public getAllUsers(): Observable<UserModel[]> {
      return this.http
        .get<UserModel[]>(`${this.hostURl}/api/users/getAllUsers`)
        .pipe(map(result => _.map(result, (t) => new UserModel(t))));
    }

    public getUser(name: string): Observable<UserModel> {
      return this.http
        .post<UserModel>(`${this.hostURl}/api/users/getUser`, name)
        .pipe(map(result => new UserModel(result)));
    }

    public addUser(name: string, role: string, avatar_path: string): Observable<UserModel> {
      return this.http
        .post<UserModel>(`${this.hostURl}/api/users/addUser`, {name, role, avatar_path})
        .pipe(map(result => new UserModel(result)));
    }
  
}
