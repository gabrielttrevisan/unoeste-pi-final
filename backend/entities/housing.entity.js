import query from "../database/core/query.js";
import exec from "../database/core/exec.js";
import sql, { Sql } from "../database/core/frag.js";

/**
 * @typedef {Object} RawHousing
 * @prop {number} HOU_ID
 * @prop {string} HOU_TITLE
 * @prop {string} HOU_TIPO
 * @prop {number} HOU_PRICE
 * @prop {string} HOU_PEO_CPF
 * @prop {string} PEO_NAME
 * @prop {string} PEO_EMAIL
 * @prop {string} PEO_PHONE
 */

/**
 * @typedef {Object} Housing
 * @prop {string} title
 * @prop {string} type
 * @prop {number} price
 * @prop {string} owner
 */

/**
 * @typedef {Object} PersistedHousing
 * @prop {number} id
 * @prop {string} title
 * @prop {string[]} type
 * @prop {number} price
 * @prop {import("./person.entity.js").Person} owner
 */

/**
 * @typedef {Object} IdentifiableHousing
 * @prop {number} id
 * @prop {string} [title]
 * @prop {string} [type]
 * @prop {number} [price]
 */

export class HousingEntity {
  /**
   * It returns all persisted housings in the database
   * @returns {Promise<PersistedHousing[]>}
   */
  async getAll() {
    /** @type {RawHousing[]} */
    const result = await query`
      SELECT H.*, P.*
      FROM houses H
        INNER JOIN people P
          ON P.PEO_CPF = H.HOU_PEO_CPF
    `.run();

    return result.map((raw) => ({
      id: raw.HOU_ID,
      owner: {
        countryCode: raw.HOU_PEO_CPF,
        email: raw.PEO_EMAIL,
        name: raw.PEO_NAME,
        phone: raw.PEO_PHONE,
      },
      price: raw.HOU_PRICE,
      title: raw.HOU_TITLE,
      type: raw.HOU_TIPO.split(/,/),
    }));
  }

  /**
   * It creates a housing registry
   * @param {Housing} housing
   * @returns {number}
   */
  async insert({ owner, price, title, type }) {
    const result = await exec`
        INSERT INTO houses 
            (HOU_TITLE, HOU_TIPO, HOU_PRICE, HOU_PEO_CPF)
        VALUES (${title}, ${type}, ${price}, ${owner})`.run();

    return result.insertId;
  }

  /**
   * It updates an exinting housing data
   * @param {IdentifiableHousing} person
   * @returns {number}
   */
  async update({ id, price, title, type }) {
    const hasPrice = Boolean(price);
    const hasPriceOrTitle = hasPrice || Boolean(title);

    const result = await exec`
        UPDATE houses SET
            ${price ? sql`HOU_PRICE = ${price}` : Sql.empty}
            ${title ? sql`${hasPrice ? sql`,` : Sql.empty}HOU_TITLE = ${title}` : Sql.empty}
            ${type ? sql`${hasPriceOrTitle ? sql`,` : Sql.empty}HOU_TIPO = ${type}` : Sql.empty}
        WHERE HOU_ID = ${id}`.run();

    return result.affectedRows;
  }

  /**
   * It deletes a housing data
   * @param {number} id
   * @returns {Promise<number>}
   */
  async delete(id) {
    const result = await exec`DELETE FROM houses WHERE HOU_ID = ${id}`.run();

    return result.affectedRows;
  }
}
