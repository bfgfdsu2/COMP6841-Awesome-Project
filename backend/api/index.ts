import express, { json, Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';

import config from './config.json';

const app = express();
// const PORT = process.env.PORT || port;
const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));

// ========================================================================= //

app.get('/echo', (req: Request, res: Response) => {
  res.json('Invoice Innovators\'s API is running😍😍');
});

// ========================================================================= //

app.use(errorHandler());

const server = app.listen(PORT, HOST, () => {
console.log(`Server started on port ${PORT} at ${HOST}`);
});

process.on('SIGINT', () => {
  server.close(() => console.log('\nShutting down server.'));
});
