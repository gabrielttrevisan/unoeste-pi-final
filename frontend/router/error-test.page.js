/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export default async function handleTestErrorPage(req, res) {
  throw new Error("Error interno de teste");
}

export const TEST_ERROR_ROUTE_MATCH = "/teste-erro";
