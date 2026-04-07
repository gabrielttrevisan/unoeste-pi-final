/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
export default function auth(req, res, next) {
  if (!req.session || !("isUserSignedIn" in req.session))
    return res.redirect("/sign-in");

  if (req.session.isUserSignedIn) return next();

  res.redirect("/sign-in");
}
