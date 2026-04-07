import { readFile } from "node:fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import HTMLContentBuilder from "../internal/builder/html-content.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export default async function handleHomePage(req, res) {
  const builder = await HTMLContentBuilder.create(req, res).withContents(
    readFile(
      path.join(__dirname, "../internal/components/housings.html"),
      "utf-8",
    ),
  );

  builder
    .setTitle("Cursemy")
    .withScript("toast")
    .withScript("housing-card.element")
    .withScript("housings")
    .withStylesheet("housings")
    .render();
}

export const HOME_ROUTE_MATCH = "";
export const HOUSING_ROUTE_MATCH = "/imoveis";
