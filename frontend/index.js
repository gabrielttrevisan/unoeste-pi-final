import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import session from "express-session";
import handleErrorPage from "./router/error.page.js";
import handleTestErrorPage, {
  TEST_ERROR_ROUTE_MATCH,
} from "./router/error-test.page.js";
import handleHomePage, {
  HOME_ROUTE_MATCH,
  HOUSING_ROUTE_MATCH,
} from "./router/home.page.js";
import handlePeoplePage, { PEOPLE_ROUTE_MATCH } from "./router/people.page.js";
import handlePersonPage, { PERSON_ROUTE_MATCH } from "./router/person.page.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

const app = express();

app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: 2048 * 1000,
    cacheControl: true,
  }),
);

app.get(HOME_ROUTE_MATCH, handleHomePage);
app.get(HOUSING_ROUTE_MATCH, handleHomePage);
app.get(PEOPLE_ROUTE_MATCH, handlePeoplePage);
app.get(PERSON_ROUTE_MATCH, handlePersonPage);
app.get(TEST_ERROR_ROUTE_MATCH, handleTestErrorPage);

const DURATION_24H = 1000 * 60 * 60 * 24;

app.use(
  session({
    secret: "amU493JyureF830Ku_sd-23ASkj",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: DURATION_24H,
    },
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    type: "application/x-www-form-urlencoded",
  }),
);

app.use((req, res) => {
  handleErrorPage(req, res, { code: 404, message: "Página não encontrada" });
});

app.use((err, req, res, _next) => {
  handleErrorPage(req, res, {
    code: 500,
    message: err.message || "Erro interno",
  });
});

app.listen(PORT, () => {
  console.log(`🔥 Listening on PORT ${PORT}...`);
});
