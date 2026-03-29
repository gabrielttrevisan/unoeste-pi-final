export class Sql {
  /** @type {string} */
  #sql = "";
  /** @type {Array.<any>} */
  #params = [];

  /**
   * @param {string} sql
   * @param {Array.<any>} params
   */
  constructor(sql, params) {
    this.#sql = sql;
    this.#params = params;
  }

  /**
   * @param {Array.<string>} raw
   * @param  {...any} values
   * @returns {SqlExecutable}
   */
  static from(strings, ...values) {
    const query = new Sql();
    const params = [];
    let raw = "";

    strings.forEach((str, i) => {
      const value = values[i];

      if (value instanceof Sql) {
        raw += str + value.#sql;
        params.push(...value.#params);
      } else if (value !== undefined) {
        raw += str + "?";
        params.push(value);
      } else {
        raw += str;
      }
    });

    query.#params = params;
    query.#sql = raw;

    return query;
  }

  get sql() {
    return this.#sql;
  }

  get params() {
    return this.#params;
  }

  static get empty() {
    return Sql.from``;
  }
}

export default function sql(strings, ...values) {
  return Sql.from(strings, ...values);
}
