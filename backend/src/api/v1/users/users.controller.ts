import { Request, Response, NextFunction, Router } from 'express';
import { NotFound, BadRequest } from 'http-errors';
import { DIContainer, MinioService, SocketsService } from '@app/services';
import { logger } from '../../../utils/logger';
import users from '../users.json';
import writeJsonFile from 'write-json-file';

export class UsersController {

    /**
     * Apply all routes for example
     *
     * @returns {Router}
     */
    public applyRoutes(): Router {
        const router = Router();

        router
            // .post('/sendMessageToClients', this.sendMessageToClients)
            // .get('/getMessage', this.getMessage);
            .post('/addUser', this.addUser)
            .post('/getUser', this.getUser);
        return router;
    }

    public async addUser(req: Request, res: Response) {
        var _users: Array<any> = users.users;

        // Check if the user exists
        _users.forEach((user) => {
            if (user.name === req.body.name)
                res.json({ "error": "User already exists" })
        })

        var newUser = {
            "name": req.body.name,
            "role": req.body.role,
            "avatar_path": req.body.avatar_path
        }

        _users.push(newUser);

        await writeJsonFile('../_users.json', { kati: 'kati' });
        (async () => {
            await writeJsonFile('foo.json', { foo: true });
        })();
        res.send("OK")
    }

    public getUser(req: Request, res: Response) {
        var _users: Array<any> = users.users;

        _users.forEach((user) => {
            if (user.name === req.body.name)
                res.send(user);
        })
    }

    /**
     * Sens a message back as a response
     */
    public getMessage(req: Request, res: Response) {
        logger.info('e getMessage request print message');

        res.json({ message: 'hello' });
    }

    /**
     * Broadcasts a received message to all connected clients
     */
    public sendMessageToClients(req: Request, res: Response) {
        const message: string = req.body.message;
        const event: string = req.body.event;

        //Sending a broadcast message to all clients
        const socketService = DIContainer.get(SocketsService);
        socketService.broadcast(event, message);

        res.json({ message: 'ok' });

    }

}
