import { Request, Response, NextFunction, Router } from 'express';
import { NotFound, BadRequest } from 'http-errors';
import { DIContainer, MinioService, SocketsService } from '@app/services';
import { logger } from '../../../utils/logger';
import { User, users } from './user.interface'
import { json } from 'body-parser';

export class UsersController {


    /**
     * Apply all routes for example
     *
     * @returns {Router}
     */
    public applyRoutes(): Router {
        const router = Router();
        
        router
            .post('/addUser', this.addUser)
            .post('/getUser', this.getUser)
            .get('/getAllUsers', this.getAllUsers);
        return router;
    }

    public async addUser(req: Request, res: Response) {
        
        try {
            
            // Check if the user exists
            users.forEach((user: User) => {
                if (user.name === req.body.name)
                    res.json({ "error": "User already exists" })
            })

            var newUser = {
                "name": req.body.name,
                "role": req.body.role,
                "avatar_path": req.body.avatar_path
            }
            users.push(newUser);

        } catch (e) {
            console.log(e)
            res.json(e)
        }

        res.send("User added");
    }

    public getUser(req: Request, res: Response) {
        try {
            users.forEach((user: User) => {
                if (user.name === req.body.name)
                    res.json(user);
            })
        } catch (e) {
            console.log(e)
            res.send(e)
        }

        res.json({ "error": 'User does not exist' })
    }

    public getAllUsers(req: Request, res: Response) {
        res.json(users);
    }

}