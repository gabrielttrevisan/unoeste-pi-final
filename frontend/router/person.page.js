import { readFile } from "node:fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import HTMLContentBuilder from "../internal/builder/html-content.js";
import handleErrorPage from "./error.page.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export default async function handlePersonPage(req, res) {
  if (!req.query || !req.query.code || typeof req.query.code !== "string")
    return handleErrorPage(req, res, {
      code: 404,
      message: `Código da pessoa não informada`,
    });

  const builder = await HTMLContentBuilder.create(req, res).withContents(
    readFile(
      path.join(__dirname, "../internal/components/person.html"),
      "utf-8",
    ),
    readFile(
      path.join(__dirname, "../internal/components/housings.html"),
      "utf-8",
    ),
  );

  builder
    .setTitle(`Pessoa - PIM`)
    .withScript("toast")
    .withScript("person-card.element")
    .withScript("housing-card.element")
    .withScript("person")
    .withStylesheet("people")
    .withStylesheet("housings")
    .withStylesheet("person")
    .render();
}

export const PERSON_ROUTE_MATCH = "/pessoa";
