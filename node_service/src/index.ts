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

app.get("/tasks", getTasksHandler);

app.get("/task", getTaskByIDHandler);

app.post("/task", postTaskHandler);

app.patch("/task", patchTaskHandler);

app.delete("/task", deleteTaskHandler);


/// WorkOrder Handlers

app.get("/work-orders", getWorkOrdersHandler);

app.post("/work-orders/today", getWorkWordersOfTodayHandler);

app.post("/work-orders/from-interval", getWorkWordersByIntervalHandler);

app.post("/work-orders/report", getWorkOrdersReportHandler);

app.get("/work-order", getWorkOrdersByIDHandler);

/// TODO: calculate cost on insert
app.post("/work-order", postWorkOrderHandler);

/// TODO: update finish date on update
app.patch("/work-order", patchWorkOrderHandler);

app.delete("/work-order", deleteWorkOrderHandler);
