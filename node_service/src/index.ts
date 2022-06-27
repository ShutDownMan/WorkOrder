import express, { Express } from 'express';
import cors from 'cors';
import multer from "multer";
import { deleteDeviceHandler, getDeviceByIDHandler, patchDeviceHandler, postDeviceHandler, getDevicesHandler, postDeviceFromJsonHandler, postDeviceFromExcelHandler, getDeviceBrandsHandler, getDeviceModelsHandler } from './Device/device';
import { deleteClientByIDHandler, getClientByIDHandler, getClientsHandler, patchClientByIDHandler, postClientHandler } from './Client/client';
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

app.get("/clients", getClientsHandler);

app.get("/client", getClientByIDHandler);

app.post("/client", postClientHandler);

app.patch("/client", patchClientByIDHandler);

app.delete("/client", deleteClientByIDHandler);


/// Device Handlers

app.get("/devices", getDevicesHandler);

app.get("/device", getDeviceByIDHandler);

/// get all device brands
app.get("/device/brands", getDeviceBrandsHandler);

/// get all models from a device brand
app.get("/device/models", getDeviceModelsHandler);

app.post("/device", postDeviceHandler);

app.post("/device/from-json", upload.single("file"), postDeviceFromJsonHandler);

app.post("/device/from-excel", upload.single("file"), postDeviceFromExcelHandler);

app.patch("/device", patchDeviceHandler);

app.delete("/device", deleteDeviceHandler);


/// Service Handlers

app.get("/services", getServicesHandler);

app.post("/services/by-device", getTopNServicesByDeviceHandler);

app.post("/services/by-revenue", getTopNServicesByRevenueHandler);

app.get("/service", getServiceByIDHandler);

app.post("/service", postServiceHandler);

app.patch("/service", patchServiceHandler);

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

app.post("/work-orders/today", getWorkWordersOfTodayHandler);

app.post("/work-orders/from-interval", getWorkWordersByIntervalHandler);

app.post("/work-orders/report", getWorkOrdersReportHandler);

/// endpoint for getting work order by id
app.get("/work-order", getWorkOrdersByIDHandler);

/// calculate cost on insert
app.post("/work-order", postWorkOrderHandler);

/// endpoint for updating work order
/// TODO: make possible to update starting date
app.patch("/work-order", patchWorkOrderHandler);

/// endpoint for deleting work order
app.delete("/work-order", deleteWorkOrderHandler);
