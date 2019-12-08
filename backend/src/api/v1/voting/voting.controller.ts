import { Request, Response, NextFunction, Router } from 'express';
import { DIContainer, MinioService, SocketsService } from '@app/services';
import { Vote, roundSum, roundVotes, voteHistory } from './voting.interface'

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
        roundVotes.push(newVote);
        res.json(newVote);
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
     *  Get votes of a round 
     * 
     * @param req.body.round the desired round 
     * @param res 
     */
    public votesOfRound(req: Request, res: Response) {
        let found: boolean = false;
        console.log(req.body.round);
        voteHistory.forEach(roundSum => {
            if (roundSum.day === req.body.round) {
                found = true;
                console.log('found');
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
        res.json("added to history");
    }
}
