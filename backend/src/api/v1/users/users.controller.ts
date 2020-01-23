import { Request, Response, NextFunction, Router } from 'express';
import { NotFound, BadRequest } from 'http-errors';
import { DIContainer, MinioService, SocketsService } from '@app/services';
import { logger } from '../../../utils/logger';
import { User, users } from './user.interface'
import { json } from 'body-parser';
import { resolve } from 'dns';
import { rejects } from 'assert';
import { round } from '../state-machine/state-machine.controller';
import { usercontroller } from '..';

function getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
}
var keyPlayers: Map<string, string> = new Map();
var bots: boolean = false;

const SocketService = DIContainer.get(SocketsService);

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
            .post('/loadingUser', this.loadingUser)
            .post('/getUser', this.getUser)
            .post('/checkUsername', this.checkUsername)
            .get('/addBots', this.addBots)
            .get('/joinedPlayers', this.joinedPlayers)
            .get('/getAllUsers', this.getAllUsers)
            .get('/distributeRoles', this.distributeRoles);
        return router;
    }

    public async addUser(req: Request, res: Response) {
        try {
            var found: boolean = false;
            // Check if the user exists
            users.forEach((user: User) => {
                if (user.name === req.body.name)
                    found = true;
            });
            if (found) {
                res.json({ "error": "User already exists" })
                return;
            }
            var newUser = {
                "name": req.body.name,
                "role": "undefined",
                "avatar_path": req.body.avatar_path,
                "position": req.body.position,
                "dead": req.body.dead
            }
            users.push(newUser);
            SocketService.broadcast("playerJoined", newUser);
            res.json("User added");
        } catch (e) {
            console.log(e)
            res.json(e)
        }
    }

    public async loadingUser(req: Request, res: Response) {
        try {
            var position = req.body.position;
            console.log("service :loading user" + position);

            SocketService.broadcast("loadingUser", position);
            res.json("User Loading");
        } catch (e) {
            console.log(e)
            res.json(e)
        }
    }

    public async changePathOfUser(todie: string) {
        var BreakException = {};
        try {
            users.forEach((user: User, index: number) => {
                if (user.name === todie) {
                    user.avatar_path = "killed_" + user.avatar_path;
                    user.dead = (round == "Open Ballot" || round == "Secret Voting") ? "day" : "night";

                    let cutOut = users.splice(index, 1)[0]; // move dead to the end
                    users.splice(users.length, 0, cutOut);
                    throw BreakException;
                }
            })
        } catch (e) {
            if (e !== BreakException) throw e;
        }
    }

    public getUser(req: Request, res: Response) {
        let found: boolean = false;
        try {
            users.forEach((user: User) => {
                if (user.name === req.body.name) {
                    res.json(user);
                    found = true;
                }
            })
        } catch (e) {
            console.log(e)
            res.send(e)
        }
        if (!found)
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
        return new Promise(async (resolve, reject) => {
            try {
                if (bots) {
                    //Find the joined user and give him the role of Detective
                    let index = users.findIndex(user => user.role == 'undefined')
                    users[index].role = 'Detective';
                    resolve();
                    return;
                }
                //For every 4 people 1 mafia (if its 7 we keep 2 Mafia)
                //Calculate roles
                let mafia: number;
                if (users.length === 7) {
                    mafia = 2;
                } else {
                    mafia = Math.floor(users.length / 4);
                }
                console.log("Distributing roles to " + users.length + " players");
                //Assign Mafia
                let rng: number;
                rng = getRandomInt(users.length);
                while (mafia != 0) {
                    if (users[rng].role == 'undefined') {
                        if (mafia % 3 == 0) {
                            users[rng].role = 'Mafioso';
                            keyPlayers.set(users[rng].name, 'Mafioso');
                            console.log('Mafioso set');
                        }
                        else if (mafia % 2 == 0) {
                            users[rng].role = 'Barman';
                            keyPlayers.set(users[rng].name, 'Barman');
                            console.log('Barman set');
                        } else {
                            users[rng].role = 'Godfather';
                            keyPlayers.set(users[rng].name, 'Godfather');
                            console.log('Godfather set');
                        }
                        mafia--;
                    }
                    rng = (rng == users.length - 1) ? 0 : rng + 1;
                }
                //Masons
                let masons = 2;
                rng = getRandomInt(users.length);
                while (masons != 0) {
                    if (users[rng].role == 'undefined') {
                        users[rng].role = 'Mason';
                        masons--;
                        console.log('Mason set');
                    }
                    rng = (rng == users.length - 1) ? 0 : rng + 1;
                }
                //Detective 
                let d = true
                rng = getRandomInt(users.length);
                while (d) {
                    if (users[rng].role == 'undefined') {
                        users[rng].role = 'Detective';
                        d = false;
                        keyPlayers.set(users[rng].name, 'Detective');
                        console.log('Detectice set');
                    }
                    rng = (rng == users.length - 1) ? 0 : rng + 1;
                }
                //Doctor  
                let doc = true
                rng = getRandomInt(users.length);
                while (doc) {
                    if (users[rng].role == 'undefined') {
                        users[rng].role = 'Doctor';
                        keyPlayers.set(users[rng].name, 'Doctor');
                        doc = false;
                        console.log('Doctor set');
                    }
                    rng = (rng == users.length - 1) ? 0 : rng + 1;
                }
                //Civilians the rest
                users.forEach((player) => {
                    if (player.role == 'undefined')
                        player.role = 'Civilian';
                    console.log("Player " + player.name + " role: " + player.role);
                });
            } catch (e) {
                console.log(e);
            }
            resolve(users);
        })
    }

    public getRole(username: string) {
        return keyPlayers.get(username);
    }

    public getPlayerfromRole(role: string) {
        return [...users.entries()]
            .filter(({ 1: v }) => v.role === role)
            .map(([k]) => k);;
    }

    private distributeBots() {
        return new Promise((resolve, reject) => {
            if (bots) {
                resolve();
                return; //already added
            }
            console.log('botakia')
            //6 Botakia
            //Masons, Barman, Godfather, Civillian, Doctor
            let BarmanBot: User = {
                name: 'Alice',
                role: 'Barman',
                avatar_path: 'player1.png',
                position: 1,
                dead: 'alive'
            }
            users.push(BarmanBot);
            console.log('Barman bot set')
            let GodfatherBot: User = {
                name: 'Maria',
                role: 'Godfather',
                avatar_path: 'player3.png',
                position: 2,
                dead: 'alive'
            }
            users.push(GodfatherBot);
            console.log('Godfather bot set')
            let MasonBot1: User = {
                name: 'George',
                role: 'Mason',
                avatar_path: 'player2.png',
                position: 3,
                dead: 'alive'
            }
            users.push(MasonBot1);
            let MasonBot2: User = {
                name: 'Kiki',
                role: 'Mason',
                avatar_path: 'player4.png',
                position: 4,
                dead: 'alive'
            }
            users.push(MasonBot2);
            console.log('Mason bots set')
            let DoctorBot: User = {
                name: 'Renata',
                role: 'Doctor',
                avatar_path: 'player7.png',
                position: 5,
                dead: 'alive'
            }
            users.push(DoctorBot);
            console.log('Doctor bot set')
            let CivilliaBot: User = {
                name: 'Manolis',
                role: 'Civilian',
                avatar_path: 'player8.png',
                position: 6,
                dead: 'alive'
            }
            users.push(CivilliaBot);
            console.log('Civillian bot set')
            resolve();
        })
    }

    public async addBots(req: Request, res: Response) {
        await usercontroller.distributeBots();
        bots = true;
        SocketService.broadcast("bots", users);
        res.json('Bots set');
    }

    public restartUsers() {
        return new Promise((resolve, reject) => {
            keyPlayers.clear();
            users.splice(0, users.length);
            bots = false;
            resolve();
        });
    }
}
