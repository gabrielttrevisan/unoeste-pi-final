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

  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async delete(req, res) {
    if (!req.params)
      return res.status(400).json({
        data: null,
        error: { code: "BAD_REQUEST", message: "Identificador não informado" },
      });

    const { id } = req.params;

    try {
      const model = new HousingModel({ id });

      if (!model.isIDValid)
        return res.status(400).json({
          data: null,
          error: {
            code: "BAD_REQUEST",
            message: "Identificador inválido",
          },
        });

      const deletedCount = await model.delete();

      res.status(200).json({
        data: deletedCount > 0,
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
  async update(req, res) {
    if (!req.params)
      return res.status(400).json({
        data: null,
        error: { code: "BAD_REQUEST", message: "Identificador não informado" },
      });

    const { id } = req.params;

    if (!req.body)
      return res.status(400).json({
        data: null,
        error: { code: "BAD_REQUEST", message: "Corpo da requisição inválido" },
      });

    const { title, type, price } = req.body;

    if (!title && !type && !price)
      return res.status(400).json({
        data: null,
        error: { code: "BAD_REQUEST", message: "Corpo da requisição inválido" },
      });

    try {
      const model = new HousingModel({ id, title, type, price });

      model.clear();

      if (!model.isIDValid)
        return res.status(400).json({
          data: null,
          error: {
            code: "BAD_REQUEST",
            message: "Identificador inválido",
          },
        });

      if (title && !model.isTitleValid)
        return res.status(400).json({
          data: null,
          error: {
            code: "BAD_REQUEST",
            message: "Título inválido",
          },
        });

      if (type && !model.isTypeValid)
        return res.status(400).json({
          data: null,
          error: {
            code: "BAD_REQUEST",
            message: "Tipo inválido",
          },
        });

      if (price && !model.isPriceValid)
        return res.status(400).json({
          data: null,
          error: {
            code: "BAD_REQUEST",
            message: "Preço inválido",
          },
        });

      const updatedCount = await model.update();

      res.status(200).json({
        data: updatedCount > 0,
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
