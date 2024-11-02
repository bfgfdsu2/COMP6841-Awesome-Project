import express, { json, Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';

import config from './config.json';
import { authLogin, authLogout, authRegister } from './auth';
import { dmCreate, messagesList } from './dm';
import { messageSend } from './messages';

const app = express();
const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));

// ==================================AUTH======================================= //

app.get('/echo', (req: Request, res: Response) => {
  res.json('Invoice Innovators\'s API is running😍😍');
});

app.post('  ', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  res.json(authRegister(email, password, nameFirst, nameLast));
});

app.post('/cryptochat/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  res.json(authLogin(email, password));
});

app.post('/cryptochat/auth/logout', (req: Request, res: Response) => {
  const token: any = req.header('token');
  const { uId } = req.body;
  res.json(authLogout(token, uId));
});

// ===================================DM====================================== //

app.post('/cryptochat/dm/create', (req: Request, res: Response) => {
  const token: any = req.header('token');
  const { uId, memberId } = req.body;
  res.json(dmCreate(token, uId, memberId));
});

app.get('/cryptochat/dm/messages/', (req: Request, res: Response, next) => {
  const token: any = req.header('token');
  const uId = parseInt(req.query.uId as string);
  const dmId = parseInt(req.query.dmId as string);
  const start = parseInt(req.query.start as string);

  res.json(messagesList(token, uId, dmId, start));
});

// ================================MESSAGE==================================== //

app.post('/cryptochat/message/send', (req: Request, res: Response, next) => {
  const token: any = req.header('token');
  const { uId, dmId, messageInfo } = req.body;

  res.json(messageSend(token, uId, dmId, messageInfo));
});

// ========================================================================= //

app.use(errorHandler());

const server = app.listen(PORT, HOST, () => {
  console.log(`Server started on port ${PORT} at ${HOST}`);
});

process.on('SIGINT', () => {
  server.close(() => console.log('\nShutting down server.'));
});
