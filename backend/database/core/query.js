import { Sql } from "./frag.js";
import db from "./index.js";

export class SqlQuery extends Sql {
  /**
   * @param {string|Sql} sql
   * @param {Array.<any>} params
   */
  constructor(sql, params) {
    if (sql instanceof Sql) super(sql.sql, structuredClone(sql.params));
    else super(sql, params);
  }

  /**
   * @param {Array.<string>} raw
   * @param  {...any} values
   * @returns {SqlQuery}
   */
  static from(strings, ...values) {
    return new SqlQuery(Sql.from(strings, ...values));
  }

  async run() {
    const conn = await db.connect();
    const [result] = await conn.query(this.sql, this.params);

    conn.release();

    return result;
  }
}

export default function query(strings, ...values) {
  return SqlQuery.from(strings, ...values);
}
