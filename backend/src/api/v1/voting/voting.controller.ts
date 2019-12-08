import { Request, Response, NextFunction, Router } from 'express';
import { DIContainer, MinioService, SocketsService } from '@app/services';
import { Vote, roundSum, roundVotes, voteHistory } from './voting.interface'
import { users } from '../users/user.interface'
import { round } from '../state-machine/state-machine.controller'

interface Suspect {
    name: string,
    votes: number
}

let suspects: Array<Suspect> = [];

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
            .get('/findSuspects', this.findSuspects)
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
        //Check if player has already voted ??
        var newVote: Vote = {
            fromWho: req.body.from,
            toWho: req.body.to,
            round: ''
        };
        if( suspects.findIndex( (elem) => elem.name === req.body.to ) === -1){
            let sus: Suspect = {
                name: req.body.to,
                votes: 1
            }
            suspects.push(sus)
        } else {
            for( var sus in suspects){ 
                if( suspects[sus].name == req.body.to){
                    suspects[sus].votes++; 
                    break;
                }
            }
        }
        roundVotes.push(newVote);
        res.json(newVote);
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

    public findSuspects(req: Request, res: Response) {
        var message;
        switch (round) {
            case 'Open Ballot':
                suspects.sort((a,b) =>  b.votes - a.votes );
                suspects =  suspects.slice(0, 2);
                message = suspects;
                break;
                
        }
    
        const SocketService = DIContainer.get(SocketsService);
        SocketService.broadcast("suspects", message);
        res.json(message);
    }
}
