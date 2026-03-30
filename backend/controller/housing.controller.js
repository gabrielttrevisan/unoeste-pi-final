import { HousingModel } from "../models/housing.model.js";

export class HousingController {
  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async getAll(_, res) {
    try {
      const model = new HousingModel();
      const housings = await model.getAll();

      res.status(200).json({
        data: housings.map((housing) => housing.serialize()),
        error: null,
      });
    } catch (error) {
      res.status(500).json({
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message ?? "Erro interno",
          stackTrace: error.stack,
        },
      });
    }
  }

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async create(req, res) {
    if (!req.body)
      return res.status(400).json({
        data: null,
        error: { code: "BAD_REQUEST", message: "Corpo da requisição inválido" },
      });

    const { title, type, price, owner } = req.body;

    try {
      const model = new HousingModel({ owner, price, title, type });

      const validity = model.validity;

      if (!validity.isValid)
        res.status(500).json({
          data: null,
          error: {
            code: "BAD_REQUEST",
            message: `Os campos a seguir estão inválidos: ${validity.invalidFields.join(", ")}`,
          },
        });

      const created = await model.create();

      res.status(200).json({
        data: created,
        error: null,
      });
    } catch (error) {
      res.status(500).json({
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: error.message ?? "Erro interno",
          stackTrace: error.stack,
        },
      });
    }
  }
}
