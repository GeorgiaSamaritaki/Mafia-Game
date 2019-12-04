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
    'Open Ballot' = 'Open Ballot',
    'Secret Voting' = 'Secret Voting' ,
    'Mafia Voting' = 'Mafia Voting',
    Doctor = 'Doctor',
    Detective ='Detective',
    Barman = 'Barman'
}

var phase = Phase.Day;
var round = Round["Open Ballot"]; 

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
            .get('/isDay', this.isDay);
        return router;
    }

    public getPhase(req: Request, res: Response) {
        console.log(phase);
        res.send(phase);
    }
    
    public getRound(req: Request, res: Response) {
        res.send(round);
    }
    
    public changePhase(req: Request, res: Response){
        if( phase == Phase.Day)
            phase = Phase.Night;
        else 
            phase = Phase.Day;
        res.send(phase);
    }

    public changeRound(req: Request, res: Response) {
        switch(round){
            case Round["Open Ballot"]:
                round = Round["Secret Voting"];
                break;
            case Round["Secret Voting"]:
                round = Round["Mafia Voting"];
                break;
            case Round["Mafia Voting"]:
                round = Round.Doctor;
                break;
            case Round.Doctor:
                round = Round.Detective;
                break;
            case Round.Detective:
                round = Round.Barman;
                break;
            case Round.Barman:
                round = Round["Open Ballot"]
                break;
        }
        res.send(round);
    }

    public isDay(req: Request, res: Response) {
        res.send(phase == Phase.Day);
    }
}
