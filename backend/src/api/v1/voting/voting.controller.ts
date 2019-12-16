import { Request, Response, NextFunction, Router } from 'express';
import { DIContainer, MinioService, SocketsService } from '@app/services';
import { Vote, roundSum, roundVotes, voteHistory } from './voting.interface'
import { User, users } from '../users/user.interface'
import { round } from '../state-machine/state-machine.controller'

import { smcontroller, usercontroller, votingcontroller } from '../index';
import { resolve } from 'dns';


interface Player {
    canVote: boolean,
    whotheyvoted: string,
    votes: number
}
let players: Map<string, Player> = new Map();
let suspects: User[] = [];
let doctor_vote: string = null;
let detective_vote: string = null;
let barman_vote: string = null;

export class VotingController {


    /**
     * Apply all routes for example
     *
     * @returns {Router}
     */
    public applyRoutes(): Router {
        const router = Router();

        router
            .post('/vote', this.vote)
            .post('/playerVotes', this.calculateVotesOfPlayer)
            .post('/getVoters', this.getVoters)
            .post('/addToHistory', this.addToHistory)
            .post('/votesOfRound', this.votesOfRound)
            .get('/getSuspects', this.getSuspectsFront);
        return router;
    }

    /**
     *  Vote somebody 
     *  
     * @param req.body.from the player that gave the vote 
     * @param req.body.to the player that got the vote 
     */
    public vote(req: Request, res: Response) {

        var newVote: Vote = {
            fromWho: req.body.from,
            toWho: req.body.to,
            round: ''
        };
        console.log("Vote received from: " + newVote.fromWho + " to: " +
            newVote.toWho + " round: " + round);
        switch (round) {
            case "Doctor":
                doctor_vote = newVote.toWho;
                break;
            case "Detective":
                detective_vote = newVote.toWho;
                break;
            case "Barman":
                if (detective_vote == newVote.toWho) detective_vote = null;
                if (doctor_vote == newVote.toWho) doctor_vote = null;
                break;
            case "Open Ballot":
            case "Secret Voting":
            case "Mafia Voting":
            case "Waiting":
                console.log("here?");
                votingcontroller.voteToDie(newVote);
                break;
            default:
                console.log("what is wrong");
        }
    }

    public voteToDie(newVote: Vote) {
        //Check if player has already voted ??
        console.log("VotetoDie: " + newVote.fromWho +
            " to: " + newVote.toWho);

        //Fix stuff for voter
        let p: Player = players.get(newVote.fromWho)
        console.log(p);
        if (!p.canVote) console.log("error voted somehow");
        if (p.whotheyvoted != "") console.log("1error voted somehow");
        p.whotheyvoted = newVote.toWho;
        players.set(newVote.fromWho, p);

        //Fix stuff for votee
        p = players.get(newVote.toWho);
        p.votes = p.votes + 1;
        players.set(newVote.toWho, p);

        const SocketService = DIContainer.get(SocketsService);
        SocketService.broadcast("vote", newVote);
    }

    /**
     *  Calculate the votes of a player
     * 
     * @param req.body.name player to count the votes 
     * @param res 
     */
    public calculateVotesOfPlayer(req: Request, res: Response) {
        let cnt: number = 0;
        roundVotes.forEach(vote => {
            if (vote.toWho === req.body.name)
                cnt++
        });
        res.json(cnt);
    }

    /**
     *  Get votes of a round from history
     * 
     * @param req.body.round the desired round 
     * @param res 
     */
    public votesOfRound(req: Request, res: Response) {
        let found: boolean = false;
        voteHistory.forEach(roundSum => {
            if (roundSum.day === req.body.round) {
                found = true;
                res.json(roundSum);
            }
        });
        if (!found) res.json("Round not found");
    }


    /**
     * 
     * @param req.body.day day/round of the voting 
     * @param req.body.dead who died 
     * @param res 
     */
    public addToHistory(req: Request, res: Response) {
        let roundSum: roundSum = {
            day: req.body.day,
            votes: roundVotes,
            dead: req.body.dead
        }
        voteHistory.push(roundSum);
        //clean this round's votes
        roundVotes.splice(0, roundVotes.length);
        res.json("added to history");
    }


    public getVoters(req: Request, res: Response) {
        let voters: string[] = [];
        roundVotes.forEach((vote) => {
            if (vote.toWho === req.body.name)
                voters.push(vote.fromWho);
        })
        if (voters.length == 0)
            res.json('')
        else
            res.json(voters);
    }

    public getSuspectsFront(req: Request, res: Response) {
        suspects.forEach((user: User) => {
            console.log("Suspect " + user.name);
        });
        if (suspects.length == 0) console.log("suspects empty");
        res.json(suspects);
    }

    public getSuspects() {
        let _suspects: Map<string, number> = new Map();
        players.forEach((p: Player, username: string) => {
            _suspects.set(username, p.votes);
        });
        _suspects[Symbol.iterator] = function* () {
            yield* [...this.entries()].sort((a, b) => a[1] - b[1]);
        }
        // for (let [key, value] of _suspects) {     // print data sorted
        //     console.log(key + ' ' + value);
        // }
        let results: User[] = [];
        let tmp: string[] = Array.from(_suspects.keys()).splice(0, 2);
        users.forEach(
            (user: User) => { if (user.name == tmp[0] || user.name == tmp[1]) results.push(user) }
        );

        return results;
        //TODO: if more people have the same vote count add them
    }

    public isMafia(username: string) {
        let role = usercontroller.getRole(username)
        return role == 'Mafioso' || role == 'Barman' || role == 'Doctor';
    }

    public canVote(username: string) {
        switch (round) {
            case 'Waiting':
                return false;
            case 'Secret Voting':
            case 'Open Ballot':
                return true;
            case 'Mafia Voting':
                return this.isMafia(username);
            case 'Doctor':
                return usercontroller.getRole(username) == 'Doctor';
            case 'Detective':
                return usercontroller.getRole(username) == 'Detective';
            case 'Barman':
                return usercontroller.getRole(username) == 'Barman';
            default:
                console.log("Voting Controller:Error");
        }
    }
    public whoToKill() {
        let suspects: Map<string, number>;
        players.forEach((p: Player, username: string) => {
            suspects.set(username, p.votes);
        });
        suspects[Symbol.iterator] = function* () {
            yield* [...this.entries()].sort((a, b) => a[1] - b[1]);
        }
        for (let [key, value] of suspects) {     // print data sorted
            // console.log(key + ' ' + value);
        }
        let todie = Array.from(suspects.keys()).slice(0, 1)[0];
        if (todie == doctor_vote) {
            console.log("The deceased was saved by the doctor");
            todie = null;
        }
        if (todie != null) {
            usercontroller.changePathOfUser(todie);
            const SocketService = DIContainer.get(SocketsService);
            SocketService.broadcast("died", users.find((user) => user.name == todie));//FIXME:kill that guy and let everyone know
        } else { //TODO:Smart Speaker -> this is the case the player was saved by the doctor
            //an event can be added so that the speaker says that nobody died todat

        }
        if (detective_vote != null) {
            const SocketService = DIContainer.get(SocketsService);
            SocketService.broadcast("detective_findings", users.find((user) => user.name == detective_vote));
            //TODO: make sure detective learns what he asked for
        }
    }

    public initVoting() {
        return new Promise((resolve, reject) => {

            console.log("Init voting with players:");

            let p: Player = {
                canVote: true,
                whotheyvoted: "",
                votes: 0,
            };

            suspects = round == 'Secret Voting' ? this.getSuspects() : users;
            players.clear();
            users.forEach(
                (user: User) => {
                    players.set(user.name, {
                        canVote: this.canVote(user.name),
                        whotheyvoted: "",
                        votes: 0,
                    });
                    console.log("Player " + user.name + "" + players.get(user.name).votes);
                }
            );
            suspects.forEach((user: User) => {
                console.log("Suspect " + user.name);
            });
            console.log("Broadcasting suspects!!");
            const SocketService = DIContainer.get(SocketsService);
            SocketService.broadcast("suspects", suspects);
            resolve();
        });
    }

    public async setPlayers() {
        return new Promise(async (resolve, reject) => {

            let p: Player = {
                canVote: false,
                whotheyvoted: "",
                votes: 0,
            };

            await this.initVoting();
            detective_vote = null;
            doctor_vote = null;
            barman_vote = null;
            resolve();
        });
    }

    public gameEnded() {
        return new Promise((resolve, reject) => {

            //Town win -> all mafia members dead
            let townWin: boolean = true;
            let mafiaMembersAlive: number = 0;
            let townMembersAlive: number = 0;
            users.forEach((user) => {
                if (votingcontroller.isMafia(user.name)) {
                    if (user.dead === 'alive') {
                        mafiaMembersAlive++;
                        townWin = false;
                    }
                } else {
                    if (user.dead === 'alive')
                        townMembersAlive++;
                }
            })
            if (townWin) {
                const SocketService = DIContainer.get(SocketsService);
                SocketService.broadcast("gameEnded", 'Town');
            } else if (mafiaMembersAlive >= townMembersAlive) {
                //If mafia members are equal or more than thw town members they always win 
                const SocketService = DIContainer.get(SocketsService);
                SocketService.broadcast("mafiaWin", 'Mafia');
            }
            resolve();
        })
    }
}
