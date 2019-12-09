import { Request, Response, NextFunction, Router } from 'express';
import { NotFound, BadRequest } from 'http-errors';
import { DIContainer, MinioService, SocketsService } from '@app/services';
import { logger } from '../../../utils/logger';
import { User, users } from './user.interface'
import { json } from 'body-parser';
import { resolve } from 'dns';
import { rejects } from 'assert';

function getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
}
var keyPlayers: Map<string, string>;
export class UsersController {


    /**
     * Apply all routes for example
     *
     * @returns {Router}
     */
    public applyRoutes(): Router {
        const router = Router();

        router
            .post('/changePathOfUser', this.changePathOfUser)
            .post('/addUser', this.addUser)
            .post('/getUser', this.getUser)
            .post('/checkUsername', this.checkUsername)
            .get('/joinedPlayers', this.joinedPlayers)
            .get('/getAllUsers', this.getAllUsers)
            .get('/distributeRoles', this.distributeRoles);
        return router;
    }

    public async addUser(req: Request, res: Response) {
        try {
            // Check if the user exists
            users.forEach((user: User) => {
                if (user.name === req.body.name)
                    res.json({ "error": "User already exists" })
            })
            var newUser = {
                "name": req.body.name,
                "role": req.body.role,
                "avatar_path": req.body.avatar_path,
                "position": req.body.position,
                "dead": req.body.dead
            }
            users.push(newUser);
            const SocketService = DIContainer.get(SocketsService);
            SocketService.broadcast("playerJoined", newUser);
            res.json("User added");
        } catch (e) {
            console.log(e)
            res.json(e)
        }
    }

    public async changePathOfUser(req: Request, res: Response) {
        var found = false;
        try {
            // Check if the user exists
            users.forEach((user: User) => {
                if (user.name === req.body.name) {
                    user.avatar_path = req.body.avatar_path;
                    found = true;
                    res.send(user);
                }
            })
            if (!found)
                res.json({ "error": "User doesn't exist" })
        } catch (e) {
            console.log(e)
            res.json(e)
        }
    }

    public getUser(req: Request, res: Response) {
        try {
            users.forEach((user: User) => {
                if (user.name === req.body.name)
                    res.json(user);
            })
        } catch (e) {
            console.log(e)
            res.send(e)
        }

        res.json({ "error": 'User does not exist' })
    }

    public getAllUsers(req: Request, res: Response) {
        res.json(users);
    }


    public async checkUsername(req: Request, res: Response) {
        var found = false;
        try {
            users.forEach((user: User) => {
                if (user.name === req.body.name) {
                    found = true;
                }
            })
            res.send(found);
        } catch (e) {
            console.log(e);
            res.send(e);
        }
    }

    public joinedPlayers(req: Request, res: Response) {
        res.json(users.length);
    }

    public distributeRoles() {
        return new Promise((resolve, reject) => {

            try {

                //For every 4 people 1 mafia (if its 7 we keep 2 Mafia)
                //Calculate roles
                let mafia: number;
                if (users.length === 7) {
                    mafia = 2;
                } else {
                    mafia = Math.floor(users.length / 4);
                }
                //Assign Mafia
                let rng: number;
                while (mafia != 0) {
                    rng = getRandomInt(users.length);
                    if (users[rng].role == 'undefined') {
                        if (rng % 3 == 2) {
                            users[rng].role = 'Mafioso';
                            keyPlayers.set(users[rng].name, 'Mafioso');
                        }
                        else if (rng % 3 == 1) {
                            users[rng].role = 'Barman';
                            keyPlayers.set(users[rng].name, 'Barman');
                        } else {
                            users[rng].role = 'Godfather';
                            keyPlayers.set(users[rng].name, 'Doctor');
                        }
                        mafia--;
                    }
                }
                //Masons
                let masons = 2;
                while (masons != 0) {
                    rng = getRandomInt(users.length);
                    if (users[rng].role == 'undefined') {
                        users[rng].role = 'Mason';
                        masons--;
                    }
                }
                //Detective 
                let d = true
                while (d) {
                    rng = getRandomInt(users.length);
                    if (users[rng].role == 'undefined') {
                        users[rng].role = 'Detective';
                        d = false;
                        keyPlayers.set(users[rng].name, 'Detective');
                    }
                }
                //Doctor 
                let doc = true
                while (doc) {
                    rng = getRandomInt(users.length);
                    if (users[rng].role == 'undefined') {
                        users[rng].role = 'Doctor';
                        keyPlayers.set(users[rng].name, 'Doctor');
                        doc = false;
                    }
                }
                //Civilians the rest
                users.forEach((player) => {
                    if (player.role == 'undefined')
                        player.role = 'Civilian';
                    console.log(player.role);
                });
            } catch (e) {
                console.log(e);
            }
            resolve(users);
            // res.json(users);
            //TODO:Event to let everyone know
        })
    }

    public getRole(username:string){
        return keyPlayers.get(username);
    }

    public getPlayerfromRole(role:string){
        return [...users.entries()]
        .filter(({ 1: v }) => v.role === role)
        .map(([k]) => k);;
    }
}
