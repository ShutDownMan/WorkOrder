import express, { Express } from 'express';
import { deleteDeviceHandler, getDeviceByIDHandler, patchDeviceHandler, postDeviceHandler } from './Device/device';
import { deleteClientByIDHandler, getClientByIDHandler, getClientsHandler, patchClientByIDHandler, postClientHandler } from './Client/client';

const app: Express = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.listen(port, () => {
	console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

/// Client Handlers

app.get("/clients", getClientsHandler);

app.get("/client", getClientByIDHandler);

app.post("/client", postClientHandler);

app.patch("/client", patchClientByIDHandler);

app.delete("/client", deleteClientByIDHandler);

/// Device Handlers

app.get("/device", getDeviceByIDHandler);

app.post("/device", postDeviceHandler);

app.patch("/device", patchDeviceHandler);

app.delete("/device", deleteDeviceHandler);
