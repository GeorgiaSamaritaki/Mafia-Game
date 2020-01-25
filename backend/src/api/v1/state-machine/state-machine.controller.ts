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

const SocketService = DIContainer.get(SocketsService);

export { round }

function delay(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    })
}

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
            .get('/getCounter', this.getCounter)
            .get('/restart', this.restartGame);
        return router;
    }

    public getRound(req: Request, res: Response) {
        res.json(round);
    }

    public async changeRound(req: Request = null, res: Response = null) {
        let end;
        switch (round) {
            case Round.Waiting:
                await usercontroller.distributeRoles().then((e) => console.log("Roles Distributed"));
                round = Round.Open_Ballot;
                break;
            case Round.Open_Ballot:
                round = Round.Secret_Voting;
                break;
            case Round.Secret_Voting:
                await votingcontroller.whoToKillDay(); //who the players killed
                //await delay(100000000); // delay to show the "animation" 
                await delay(13000);
                await votingcontroller.gameEnded().then( value => {
                    console.log(`Game ended: ${value}`);
                    end = value;
                });
                round = Round.Mafia_Voting;
                break;
            case Round.Mafia_Voting:
                await votingcontroller.setVictim();
                round = Round.Doctor;
                break;
            case Round.Doctor:
                round = Round.Detective;
                break;
            case Round.Detective:
                round = Round.Barman;
                break;
            case Round.Barman:
                await votingcontroller.whoToKillNight(); // who the mafia killed
                await votingcontroller.gameEnded().then( value => {
                    end = value;
                });
                // await delay(15000); // delay to show the "animation" 
                round = Round.Open_Ballot
                roundCounter++;
                console.log(roundCounter);
                SocketService.broadcast("dayCounter", roundCounter);
                break;
        }
        if( !end ){
            await votingcontroller.setPlayers().then(() => { console.log("players set"); });
            SocketService.broadcast("roundChange", round);
        } 
        if (res != null) res.json(`Round changed to ${round}`);
    }

    public selectNarrator(req: Request, res: Response) {
        SocketService.broadcast("selectNarrator", '');
        res.json('OK');
    }

    public getCounter(req: Request, res: Response) {
        res.json(roundCounter);
    }

    public async restartGame(req: Request, res: Response) {
        console.log('Restarting game');
        //State machine restart
        phase = Phase.Day;
        round = Round.Waiting;
        roundCounter = 1;

        //Users restart
        await usercontroller.restartUsers();
        //Votes restart
        await votingcontroller.restartVotes();

        SocketService.broadcast("restart", '');
        res.status(200).json('OK');
    }
}