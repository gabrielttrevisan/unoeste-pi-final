import { Sql } from "./frag.js";
import db from "./index.js";

export class SqlExecutable extends Sql {
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
   * @returns {SqlExecutable}
   */
  static from(strings, ...values) {
    return new SqlExecutable(Sql.from(strings, ...values));
  }

  /**
   * @returns {Promise<import("mysql2/promise").QueryResult>}
   */
  async run() {
    const conn = await db.connect();
    const [result] = await conn.execute(this.sql, this.params);

    conn.release();

    return result;
  }
}

export default function exec(strings, ...values) {
  return SqlExecutable.from(strings, ...values);
}
