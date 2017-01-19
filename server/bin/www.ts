import { Server } from '../server';
import { serverContainer } from '../inversify.config';

let server = serverContainer.get<Server>(Server);

server.setUpAndStart();
