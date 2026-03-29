import { Router } from "express";
import { PersonController } from "../controller/person.controller.js";

const personRouter = Router();
const personController = new PersonController();

personRouter.get("/", personController.getAll);
personRouter.post("/", personController.create);
personRouter.delete("/:cpf", personController.delete);

export default personRouter;
