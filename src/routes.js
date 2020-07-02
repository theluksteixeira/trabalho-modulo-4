import express from 'express';
import ContasController from './controller/contasController.js';

const routes = express.Router();

const contasController = new ContasController();

routes.get("/", contasController.index);

export default routes;