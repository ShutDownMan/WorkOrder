import express, { Express } from 'express';
import { deleteDeviceHandler, getDeviceByIDHandler, patchDeviceHandler, postDeviceHandler, getDevicesHandler } from './Device/device';
import { deleteClientByIDHandler, getClientByIDHandler, getClientsHandler, patchClientByIDHandler, postClientHandler } from './Client/client';
import cors from 'cors';
import { deleteServiceHandler, getServiceByIDHandler, getServicesHandler, patchServiceHandler, postServiceHandler } from './Service/service';
import { deleteWorkOrderHandler, getWorkOrdersByIDHandler, getWorkOrdersHandler, patchWorkOrderHandler, postWorkOrderHandler } from './WorkOrder/work-order';

const app: Express = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

const allowedOrigins = ['*'];

const options: cors.CorsOptions = {
	origin: allowedOrigins
};

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

app.get("/devices", getDevicesHandler);

app.get("/device", getDeviceByIDHandler);

app.post("/device", postDeviceHandler);

app.patch("/device", patchDeviceHandler);

app.delete("/device", deleteDeviceHandler);


/// Service Handlers

app.get("/services", getServicesHandler);

app.get("/service", getServiceByIDHandler);

app.post("/service", postServiceHandler);

app.patch("/service", patchServiceHandler);

app.delete("/service", deleteServiceHandler);


// /// Task Handlers

// app.get("/tasks", getTasksHandler);

// app.get("/task", getTasksByIDHandler);

// app.post("/task", postTaskHandler);

// app.patch("/task", patchTaskHandler);

// app.delete("/task", deleteTaskHandler);


/// WorkOrder Handlers

app.get("/work-orders", getWorkOrdersHandler);

app.get("/work-order", getWorkOrdersByIDHandler);

app.post("/work-order", postWorkOrderHandler);

app.patch("/work-order", patchWorkOrderHandler);

app.delete("/work-order", deleteWorkOrderHandler);
