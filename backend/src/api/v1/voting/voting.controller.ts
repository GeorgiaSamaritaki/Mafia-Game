import { Request, Response, NextFunction, Router } from 'express';
import { NotFound, BadRequest } from 'http-errors';
import { DIContainer, MinioService, SocketsService } from '@app/services';
import { logger } from '../../../utils/logger';
import { json } from 'body-parser';

export class VotingController {


    /**
     * Apply all routes for example
     *
     * @returns {Router}
     */
    public applyRoutes(): Router {
        const router = Router();

        router
            // .post('/changePathOfUser', this.changePathOfUser)
            // .post('/addUser', this.addUser)
            // .post('/getUser', this.getUser)
            // .post('/checkUsername', this.checkUsername)
            // .post('/test', this.test) 
            // .get('/getAllUsers', this.getAllUsers);
        return router;
    }

    
    // public async addUser(req: Request, res: Response) {
    //     try {
    //         // Check if the user exists
    //         users.forEach((user: User) => {
    //             if (user.name === req.body.name)
    //                 res.json({ "error": "User already exists" })
    //         })
    //         var newUser = {
    //             "name": req.body.name,
    //             "role": req.body.role,
    //             "avatar_path": req.body.avatar_path
    //         }
    //         users.push(newUser);
    //         res.json("User added");
    //     } catch (e) {
    //         console.log(e)
    //         res.json(e)
    //     }
    // }

    // public async changePathOfUser(req: Request, res: Response) {
    //     var found = false;
    //     try {
    //         // Check if the user exists
    //         users.forEach((user: User) => {
    //             if (user.name === req.body.name) {
    //                 user.avatar_path = req.body.avatar_path;
    //                 found = true;
    //                 res.send(user);
    //             }
    //         })
    //         if (!found)
    //             res.json({ "error": "User doesn't exist" })
    //     } catch (e) {
    //         console.log(e)
    //         res.json(e)
    //     }
    // }

    // public getUser(req: Request, res: Response) {
    //     try {
    //         users.forEach((user: User) => {
    //             if (user.name === req.body.name)
    //                 res.json(user);
    //         })
    //     } catch (e) {
    //         console.log(e)
    //         res.send(e)
    //     }

    //     res.json({ "error": 'User does not exist' })
    // }

    // public getAllUsers(req: Request, res: Response) {
    //     res.json(users);
    // }

    // public async checkUsername(req: Request, res:Response) {
    //     var found=false;
    //     try {
    //         users.forEach((user: User) => {
    //             if (user.name === req.body.name) {
    //                 found = true;
    //             } 
    //         }) 
    //         res.send(found);
    //     } catch(e) {
    //         console.log(e);
    //         res.send(e);
    //     }
    // }

    // public test(req:Request, res: Response) {
    //     const message: string = req.body.message;
    //     const event: string = req.body.event;

    //     const socketsService = DIContainer.get(SocketsService);
    //     socketsService.broadcast(event, message);
    // }
}
