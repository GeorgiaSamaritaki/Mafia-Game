import { Request, Response, NextFunction, Router } from 'express';
import { NotFound, BadRequest } from 'http-errors';
import { DIContainer, MinioService, SocketsService } from '@app/services';
import { logger } from '../../../utils/logger';
import { json } from 'body-parser';


enum Phase {
    Day = 'Day',
    Night = 'Night'
}

enum Round {
    Waiting = 'Waiting',
    Open_Ballot = 'Open Ballot',
    Secret_Voting = 'Secret Voting',
    Mafia_Voting = 'Mafia Voting',
    Doctor = 'Doctor',
    Detective = 'Detective',
    Barman = 'Barman'
}

var phase = Phase.Day;
var round: string = Round.Waiting;

export class StateMachineController {

    /**
     * Apply all routes for example
     *
     * @returns {Router}
     */
    public applyRoutes(): Router {
        const router = Router();

        router
            .get('/getRound', this.getRound)
            .get('/getPhase', this.getPhase)
            .get('/changePhase', this.changePhase)
            .get('/changeRound', this.changeRound)
            .get('/isDay', this.isDay)
            .post('/treatsb', this.treatsb);
        return router;
    }

    public getPhase(req: Request, res: Response) {
        console.log(phase);
        res.json(phase);
    }

    public getRound(req: Request, res: Response) {
        res.json(round);
    }

    public changePhase(req: Request, res: Response) {
        if (phase == Phase.Day)
            phase = Phase.Night;
        else
            phase = Phase.Day;
        res.json(phase);
    }

    public changeRound(req: Request, res: Response) {
        switch (round) {
            case Round.Waiting:
                round = Round.Open_Ballot;
                break;
            case Round.Open_Ballot:
                round = Round.Secret_Voting;
                break;
            case Round.Secret_Voting:
                round = Round.Mafia_Voting;
                break;
            case Round.Mafia_Voting:
                round = Round.Doctor;
                break;
            case Round.Doctor:
                round = Round.Detective;
                break;
            case Round.Detective:
                round = Round.Barman;
                break;
            case Round.Barman:
                round = Round.Open_Ballot
                break;
        }
        res.json(round);
    }


    public isDay(req: Request, res: Response) {
        res.json(phase == Phase.Day); 
    }

    public treatsb(req: Request) {
        const message: string = req.body.message;
        const event: string = req.body.event;

        const SocketService = DIContainer.get(SocketsService);
        SocketService.broadcast(event, message);
    }
}
