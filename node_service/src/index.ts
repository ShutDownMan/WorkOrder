import express, { Express } from 'express';
import cors from 'cors';
import multer from "multer";
import { deleteDeviceHandler, getDeviceByIDHandler, patchDeviceHandler, postDeviceHandler, getDevicesHandler, postDeviceFromJsonHandler, postDeviceFromExcelHandler, getDeviceBrandsHandler, getDeviceModelsHandler, postDeviceDummyHandler } from './Device/device';
import { deleteClientByIDHandler, getClientByIDHandler, getClientsHandler, patchClientByIDHandler, postClientDummyHandler, postClientHandler } from './Client/client';
import { deleteServiceHandler, getServiceByIDHandler, getServicesHandler, getTopNServicesByDeviceHandler, getTopNServicesByRevenueHandler, patchServiceHandler, postServiceHandler } from './Service/service';
import { deleteWorkOrderHandler, getWorkOrdersByIDHandler, getWorkOrdersHandler, getWorkOrdersReportHandler, getWorkWordersByInterval as getWorkWordersByIntervalHandler, getWorkWordersOfToday as getWorkWordersOfTodayHandler, patchWorkOrderHandler, postWorkOrderHandler } from './WorkOrder/work-order';
import { deleteTaskHandler, getTaskByIDHandler, getTasksHandler, patchTaskHandler, postTaskHandler } from './Task/task';

const app: Express = express();
const port = process.env.PORT || 3000;

const upload = multer();

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

/// endpoint to get all clients
app.get("/clients", getClientsHandler);

/// endpoint to get client by id
app.get("/client", getClientByIDHandler);

/// endpoint to create new client
app.post("/client", postClientHandler);

/// endpoint to create a dummy client
app.post("/client/dummy", postClientDummyHandler);

/// endpoint to update client
app.patch("/client", patchClientByIDHandler);

/// endpoint to delete client
app.delete("/client", deleteClientByIDHandler);


/// Device Handlers

/// endpoint to get all devices
app.get("/devices", getDevicesHandler);

/// endpoint to get device by id
app.get("/device", getDeviceByIDHandler);

/// get all device brands
app.get("/device/brands", getDeviceBrandsHandler);

/// get all models from a device brand
app.get("/device/models", getDeviceModelsHandler);

/// endpoint to create new device
app.post("/device", postDeviceHandler);

/// endpoint to create a dummy device
app.post("/device/dummy", postDeviceDummyHandler);

app.post("/device/from-json", upload.single("file"), postDeviceFromJsonHandler);

app.post("/device/from-excel", upload.single("file"), postDeviceFromExcelHandler);

/// endpoint to update device
app.patch("/device", patchDeviceHandler);

/// endpoint to delete device
app.delete("/device", deleteDeviceHandler);


/// Service Handlers

/// endpoint to get all services
app.get("/services", getServicesHandler);

/// endpoint to get top n services by device
app.post("/services/by-device", getTopNServicesByDeviceHandler);

/// endpoint to get top n services by revenue
app.post("/services/by-revenue", getTopNServicesByRevenueHandler);

/// endpoint to get service by id
app.get("/service", getServiceByIDHandler);

/// endpoint to create new service
app.post("/service", postServiceHandler);

/// endpoint to update service
app.patch("/service", patchServiceHandler);

/// endpoint to delete service
app.delete("/service", deleteServiceHandler);


/// Task Handlers

/// endpoint to get all tasks
app.get("/tasks", getTasksHandler);

/// endpoint to get a task by id
app.get("/task", getTaskByIDHandler);

/// endpoint to insert a new task
app.post("/task", postTaskHandler);

/// endpoint to update a task
app.patch("/task", patchTaskHandler);

/// endpoint to delete a task
app.delete("/task", deleteTaskHandler);


/// WorkOrder Handlers

/// endpoint to get all work orders
app.get("/work-orders", getWorkOrdersHandler);

/// endpoint to get today's work orders
app.post("/work-orders/today", getWorkWordersOfTodayHandler);

/// endpoint to get work orders by interval
app.post("/work-orders/from-interval", getWorkWordersByIntervalHandler);

/// endpoint to get work order reports given an interval
app.post("/work-orders/report", getWorkOrdersReportHandler);

/// endpoint for getting work order by id
app.get("/work-order", getWorkOrdersByIDHandler);

/// calculate cost on insert
app.post("/work-order", postWorkOrderHandler);

/// endpoint for updating work order
app.patch("/work-order", patchWorkOrderHandler);

/// endpoint for deleting work order
app.delete("/work-order", deleteWorkOrderHandler);
