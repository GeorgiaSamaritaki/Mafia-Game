import { Request, Response, NextFunction, Router } from 'express';
import { NotFound, BadRequest } from 'http-errors';
import { DIContainer, MinioService, SocketsService } from '@app/services';
import { votingcontroller, usercontroller } from '../index';
import { Socket } from 'dgram';

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
var roundCounter: number = 1;

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
            .get('/selectNarrator', this.selectNarrator)
            .get('/getCounter', this.getCounter);
        return router;
    }

    public getRound(req: Request, res: Response) {
        res.json(round);
    }

    public async changeRound(req: Request, res: Response) {
        switch (round) {
            case Round.Waiting:
                await usercontroller.distributeRoles().then((e) => console.log("Roles Distributed"));
                round = Round.Open_Ballot;
                break;
            case Round.Open_Ballot:
                round = Round.Secret_Voting;
                break;
            case Round.Secret_Voting:
                await votingcontroller.whoToKill(); //who the players killed
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
                await votingcontroller.whoToKill(); // who the mafia killed
                round = Round.Open_Ballot
                roundCounter++;
                break;
        }

        await votingcontroller.setPlayers().then( () => {
            console.log("players set");
            const SocketService = DIContainer.get(SocketsService);
            SocketService.broadcast("roundChange", round);
            res.json(`Round changed to ${round}`);
        });
    }

    public selectNarrator(req: Request, res: Response) {
        const SocketService = DIContainer.get(SocketsService);
        SocketService.broadcast("selectNarrator", '');
        res.json('OK');
    }

    public getCounter(req: Request, res: Response) {
        res.json(roundCounter);
    }
}
