import { PersonModel } from "../models/person.model.js";

/**
 * @callback RouteHandlerCallback
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */

/**
 * @typedef {RouteHandler}
 * @prop {RouteHandlerCallback} handler
 * @prop {string} path
 */

export class PersonController {
  /**
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @param {import("express").NextFunction} next
   */
  async getAll(_, res) {
    try {
      const model = new PersonModel({ countryCode: "all" });
      const people = await model.getAll();

      res.status(200).json({
        data: people.map((person) => person.serialize()),
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

    const { cpf, name, email, phone } = req.body;

    try {
      const model = new PersonModel({ countryCode: cpf, name, email, phone });

      model.clear();

      const validity = model.validity;

      if (!validity.isValid) {
        return res.status(400).json({
          data: null,
          error: {
            code: "BAD_REQUEST",
            message:
              "Os campos a seguir estão inválidos: " +
              validity.invalidFields.join(", "),
          },
        });
      }

      const createdCount = await model.create();

      res.status(200).json({
        data: createdCount > 0,
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

    const { cpf } = req.params;

    try {
      const model = new PersonModel({ countryCode: cpf });

      if (!model.isCountryCodeValid)
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
}
