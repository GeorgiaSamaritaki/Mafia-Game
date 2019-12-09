import { Request, Response, NextFunction, Router } from 'express';
import { NotFound, BadRequest } from 'http-errors';
import { DIContainer, MinioService, SocketsService } from '@app/services';
import { votingcontroller,usercontroller } from '../index';

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

export { round }

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
            .get('/changeRound', this.changeRound)
            .get('/selectNarrator', this.selectNarrator);
        return router;
    }

    public getRound(req: Request, res: Response) {
        res.json(round);
    }

    public changeRound(req: Request, res: Response) {
        switch (round) {
            case Round.Waiting:
                // distribute roles set players
                votingcontroller.setPlayers();
                usercontroller.distributeRoles();
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
        const SocketService = DIContainer.get(SocketsService);
        SocketService.broadcast("roundChange", round);
    }
    public selectNarrator(req: Request, res: Response) {
        console.log('broadcasting');
        const SocketService = DIContainer.get(SocketsService);
        SocketService.broadcast("selectNarrator", '');
        res.json('OK')
    }
        SocketService.broadcast("selectNarrator", '');

}
