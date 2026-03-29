import query from "../database/core/query.js";
import exec from "../database/core/exec.js";
import sql, { Sql } from "../database/core/frag.js";

/**
 * @typedef {Object} RawPerson
 * @prop {string} PEO_CPF
 * @prop {string} PEO_NAME
 * @prop {string} PEO_PHONE
 * @prop {string} PEO_EMAIL
 */

/**
 * @typedef {Object} Person
 * @prop {string} countryCode
 * @prop {string} name
 * @prop {string} phone
 * @prop {string} email
 */

/**
 * @typedef {Object} PersonUpdate
 * @prop {string} countryCode
 * @prop {string} [name]
 * @prop {string} [phone]
 * @prop {string} [email]
 */

export class PersonEntity {
  /**
   * It returns all persisted people in the database
   * @returns {Promise<Person[]>}
   */
  async getAll() {
    /** @type {RawPerson[]} */
    const result = await query`SELECT * FROM people`.run();

    return result.map((raw) => ({
      countryCode: raw.PEO_CPF,
      email: raw.PEO_EMAIL,
      name: raw.PEO_NAME,
      phone: raw.PEO_PHONE,
    }));
  }

  /**
   * @param {Person} person
   * @returns {number}
   */
  async insert({ countryCode, email, name, phone }) {
    const result = await exec`
        INSERT INTO people 
            (PEO_CPF, PERO_EMAIL, PEO_NAME, PEO_PHONE)
        VALUES (${countryCode}, ${email}, ${name}, ${phone})`.run();

    return result.affectedRows;
  }

  /**
   * @param {PersonUpdate} person
   * @returns {number}
   */
  async update({ countryCode, email, name, phone }) {
    const hasEmail = Boolean(email);
    const hasEmailOrName = hasEmail || Boolean(name);

    const result = await exec`
        UPDATE people SET
            ${email ? sql`PEO_EMAIL = ${email}` : Sql.empty}
            ${name ? sql`${hasEmail ? sql`,` : Sql.empty}PEO_NAME = ${name}` : Sql.empty}
            ${phone ? sql`${hasEmailOrName ? sql`,` : Sql.empty}PEO_PHONE = ${phone}` : Sql.empty}
        WHERE PEO_CPF = ${countryCode}`.run();

    return result.affectedRows;
  }

  /**
   * @param {string} countryCode
   * @returns {Promise<number>}
   */
  async delete(countryCode) {
    const result =
      await exec`DELETE FROM people WHERE countryCode = ${countryCode}`.run();

    return result.affectedRows;
  }
}
