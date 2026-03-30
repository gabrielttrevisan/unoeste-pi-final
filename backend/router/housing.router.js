import { Router } from "express";
import { HousingController } from "../controller/housing.controller.js";

const housingRouter = Router();
const housingController = new HousingController();

housingRouter.get("/", housingController.getAll);
housingRouter.post("/", housingController.create);
housingRouter.delete("/:id", housingController.delete);
housingRouter.put("/:id", housingController.update);

export default housingRouter;
