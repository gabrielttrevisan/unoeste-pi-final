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
export default async function handlePeoplePage(req, res) {
  const builder = await HTMLContentBuilder.create(req, res).withContents(
    readFile(
      path.join(__dirname, "../internal/components/people.html"),
      "utf-8",
    ),
    readFile(
      path.join(__dirname, "../internal/components/person-form.html"),
      "utf-8",
    ),
  );

  builder
    .setTitle("Pessoas - PIM")
    .withScript("toast")
    .withScript("person-card.element")
    .withScript("people")
    .withScript("person-form")
    .withStylesheet("people")
    .render();
}

export const PEOPLE_ROUTE_MATCH = "/pessoas";
