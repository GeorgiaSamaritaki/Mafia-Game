import { Request, Response, NextFunction, Router } from 'express';
import { DIContainer, MinioService, SocketsService } from '@app/services';
import { Vote, roundSum, roundVotes, voteHistory } from './voting.interface'
import { User, users } from '../users/user.interface'
import { round } from '../state-machine/state-machine.controller'
import { smcontroller, usercontroller, votingcontroller } from '../index';

interface Player {
    canVote: boolean,
    whotheyvoted: string,
    votes: number
}
let players: Map<string, Player> = new Map();
let suspects: User[] = [];
let doctor_vote: string = null;
let detective_vote: string = null;
var todie_night: string;

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
                votingcontroller.voteToDie(newVote);
                if (!votingcontroller.everyoneVoted()) {
                    res.json(newVote);
                    return;
                }
                break;
            default:
                console.log("what is wrong");
        }
        if (votingcontroller.everyoneVoted()) smcontroller.changeRound();
    }

    public everyoneVoted() {
        for (var [layer_name, player] of players)
            if (player.canVote && player.whotheyvoted === "")
                return false;
        return true;
    }

    public voteToDie(newVote: Vote) {
        //Check if player has already voted ??
        console.log("VotetoDie: " + newVote.fromWho +
            " to: " + newVote.toWho);

        //Fix stuff for voter
        let p = players.get(newVote.fromWho);
        if (p == null) { console.log("someone dead voting"); return; }
        if (!p.canVote)
            console.log("error voted somehow");
        if (p.whotheyvoted != "")
            console.log("1error voted again?");//todo: the player reloaded the page and voted again
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
            yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
        }
        let string1: string = "";
        let string2: string = "";
        for (let [key, value] of _suspects) {     // nothing actually works i swear
            console.log(key + ' ' + value);
            if (string1 != "") { string2 = key; break; }
            string1 = key;
        }
        console.log(" 1. " + string1 + " 2. " + string2);
        var results: User[] = [];
        results.push(users.find((user) => user.name == string1));
        results.push(users.find((user) => user.name == string2));

        return results;
        //TODO: if more people have the same vote count add them
    }

    public isMafia(username: string) {
        let role: string = users.find((user) => user.name == username).role;
        return role == 'Mafioso' || role == 'Barman' || role == 'Godfather';
    }

    public canVote(username: string) {
        // console.log("       round: " + round + "  username: " + username + " role: " + users.find((user) => user.name == username).role);
        switch (round) {
            case 'Waiting':
                return false;
            case 'Secret Voting':
            case 'Open Ballot':
                return true;
            case 'Mafia Voting':
                return votingcontroller.isMafia(username);
            case 'Doctor':
                return users.find((user) => user.name == username).role == 'Doctor';
            case 'Detective':
                return users.find((user) => user.name == username).role == 'Detective';
            case 'Barman':
                return users.find((user) => user.name == username).role == 'Barman';
            default:
                console.log("Voting Controller:Error");
        }
    }
    public whoToKillDay() {
        let suspects: Map<string, number> = new Map();
        players.forEach((p: Player, username: string) => {
            suspects.set(username, p.votes);
        });
        suspects[Symbol.iterator] = function* () {
            yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
        }
        var todie: string;
        for (let [key, value] of suspects) {     // print data sorted
            // console.log("Day sorted " + key + ' ' + value);
            todie = key; break;
        }
        console.log("Day:brodcasting todie " + todie);
        usercontroller.changePathOfUser(todie);
        const SocketService = DIContainer.get(SocketsService);
        SocketService.broadcast("died", users.find((user) => user.name == todie));
    }

    public setVictim() {
        let suspects: Map<string, number> = new Map();
        players.forEach((p: Player, username: string) => {
            suspects.set(username, p.votes);
        });
        suspects[Symbol.iterator] = function* () {
            yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
        }

        for (let [key, value] of suspects) {
            todie_night = key; break;
        }
        console.log("Night: victim " + todie_night);
    }

    public whoToKillNight() {
        if (todie_night == doctor_vote) {
            console.log("The deceased was saved by the doctor");
            todie_night = null;
        }
        if (todie_night != null) {
            usercontroller.changePathOfUser(todie_night);
            const SocketService = DIContainer.get(SocketsService);
            SocketService.broadcast("died", users.find((user) => user.name == todie_night));//FIXME:kill that guy and let everyone know
        } else { //TODO:Smart Speaker -> this is the case the player was saved by the doctor
            //an event can be added so that the speaker says that nobody died todat

        }
        if (detective_vote != null) {
            const SocketService = DIContainer.get(SocketsService);
            SocketService.broadcast("detective_findings", users.find((user) => user.name == detective_vote));
            //TODO: make sure detective learns what he asked for
        }
    }

    getalive() {
        var tmp: User[] = [];
        users.forEach(
            (user: User) => { if (user.dead == "alive") tmp.push(user) }
        );
        return tmp;
    }

    public initVoting() {
        return new Promise((resolve, reject) => {

            console.log("Init voting with players:");

            suspects = (round == 'Secret Voting') ? this.getSuspects() : this.getalive();
            players.clear();
            users.forEach(
                (user: User) => {
                    if (user.dead == "alive") {
                        players.set(user.name, {
                            canVote: this.canVote(user.name),
                            whotheyvoted: "",
                            votes: 0,
                        });
                        console.log("    Player " + user.name + " can vote: " + players.get(user.name).canVote);
                    } else {
                        console.log("    Dead Player " + user.name);
                    }
                }
            );
            suspects.forEach((user: User) => {
                console.log("    Suspect " + user.name);
            });
            console.log("    Broadcasting suspects!!");
            const SocketService = DIContainer.get(SocketsService);
            SocketService.broadcast("suspects", suspects);
            resolve();
        });
    }

    public async setPlayers() {
        return new Promise(async (resolve, reject) => {
            await votingcontroller.initVoting();
            detective_vote = null;
            doctor_vote = null;
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
