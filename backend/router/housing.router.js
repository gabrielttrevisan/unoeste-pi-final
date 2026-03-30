import { Router } from "express";
import { HousingController } from "../controller/housing.controller.js";

const housingRouter = Router();
const housingController = new HousingController();

housingRouter.get("/", housingController.getAll);
housingRouter.post("/", housingController.create);

export default housingRouter;
