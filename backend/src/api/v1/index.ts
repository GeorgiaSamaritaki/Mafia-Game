import * as express from 'express';
import { ResourceController } from '../shared';
import { ITask, TaskModel } from '@app/models';
import { FilesController } from './files/files.controller';
import { SocketEventsController } from './socket-events/socket-events.controller';
import { ExampleController } from './example/example.controller';
import { UsersController } from './users/users.controller';
import { StateMachineController } from './state-machine/state-machine.controller';
import { VotingController } from './voting/voting.controller';

const apiV1Router = express.Router();

export const smcontroller = new StateMachineController();
export const usercontroller = new UsersController();
export const votingcontroller = new VotingController();

apiV1Router
  // Sockets events routes
  .use(
    '/socket-events',
    new SocketEventsController().applyRoutes()
  )

  // Sockets events routes
  .use(
    '/files',
    new FilesController().applyRoutes()
  )

  // Task routes
  .use(
    '/tasks',
    new ResourceController<ITask>(TaskModel).applyRoutes()
  )

  // Example routes
  .use(
    '/example',
    new ExampleController().applyRoutes()
  )

  .use(
    '/users',
    usercontroller.applyRoutes()
  )

  .use(
    '/stateMachine',
    smcontroller.applyRoutes()
  )
  
  .use(
    '/votes',
    votingcontroller.applyRoutes()
  );

export { apiV1Router };

