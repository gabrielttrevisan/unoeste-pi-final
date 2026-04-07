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
export default async function handleErrorPage(
  req,
  res,
  { message, code } = {},
) {
  const builder = await HTMLContentBuilder.create(req, res).withContents(
    readFile(
      path.join(__dirname, "../internal/components/error.html"),
      "utf-8",
    ),
  );

  builder
    .setTitle(`Cursemy - ${message}`)
    .withStylesheet("error")
    .replace("{{STATUS_CODE}}", code)
    .replace("{{STATUS_MESSAGE}}", message)
    .render();
}

export const ROUTE_MATCH = "";
