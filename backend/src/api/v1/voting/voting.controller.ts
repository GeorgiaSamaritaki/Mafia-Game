import { Request, Response, NextFunction, Router } from 'express';
import { DIContainer, MinioService, SocketsService } from '@app/services';
import { Vote, roundSum, roundVotes, voteHistory } from './voting.interface'
import { User, users } from '../users/user.interface'
import { round } from '../state-machine/state-machine.controller'
import { request } from 'http';

import { smcontroller, usercontroller } from '../index';


interface Player {
    canVote: boolean,
    whotheyvoted: string,
    votes: number
}
let players: Map<string, Player> = new Map();
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
            .post('/votesOfRound', this.votesOfRound)
            .post('/getVoters', this.getVoters)
            .post('/addToHistory', this.addToHistory);
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
                this.voteToDie(newVote.fromWho, newVote.toWho, newVote);
        }
    }
    public voteToDie(fromWho: string, toWho: string, newVote: Vote) {
        //Check if player has already voted ??
        let p = players.get(fromWho)
        if (!p.canVote) console.log("error voted somehow");
        if (p.whotheyvoted != "") console.log("1error voted somehow");
        p.whotheyvoted = toWho;
        p.votes = p.votes++;
        players.set(newVote.fromWho, p);
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

    public getSuspects() {
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
        return Array.from(suspects.keys()).slice(0, 2);
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
                return usercontroller.getRole(username) == 'Doctor';
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
            const SocketService = DIContainer.get(SocketsService);
            SocketService.broadcast("died", todie);//FIXME:kill that guy and let everyone know
        }
        if (detective_vote != null) {
            const SocketService = DIContainer.get(SocketsService);
            SocketService.broadcast("detective_findings", detective_vote);
            //TODO: make sure detective learns what he asked for
        }

    public async initVoting() {
        let p: Player = {
            canVote: true,
            whotheyvoted: "",
            votes: 0,
        };

        let suspects: string[];
        if (round == 'Secret Voting') suspects = this.getSuspects();
        else suspects = Array.from(players.keys());

        players.forEach((p: Player, username: string) => {
            players.set(username, {
                canVote: this.canVote(username),
                whotheyvoted: "",
                votes: 0,
            });
        });

        const SocketService = DIContainer.get(SocketsService);
        await SocketService.broadcast("suspects", suspects);
    }

    public async setPlayers() {
        let p: Player = {
            canVote: false,
            whotheyvoted: "",
            votes: 0,
        };
        users.forEach(
            (user: User) => players.set(user.name, p)
        );
        await this.initVoting();
        detective_vote = null;
        doctor_vote = null;
        barman_vote = null;
    }
}
