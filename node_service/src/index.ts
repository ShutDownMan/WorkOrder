import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
