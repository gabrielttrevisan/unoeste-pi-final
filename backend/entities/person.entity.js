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
 * @typedef {Object} IdentifiablePerson
 * @prop {string} countryCode
 * @prop {string} [name]
 * @prop {string} [phone]
 * @prop {string} [email]
 */

/**
 * @typedef {Object} OwnedHousing
 * @prop {number} id
 * @prop {string} title
 * @prop {string[]} type
 * @prop {number} price
 */

/**
 * @typedef {Object} HousingsOwner
 * @prop {string} countryCode
 * @prop {string} name
 * @prop {string} phone
 * @prop {string} email
 * @prop {OwnedHousing[]} housings
 */

/**
 * @typedef {Object} RawOwnedHousing
 * @prop {number} HOU_ID
 * @prop {string} HOU_TITLE
 * @prop {string} HOU_TYPE
 * @prop {number} HOU_PRICE
 * @prop {string} HOU_PEO_CPF
 * @prop {string} OWNER_NAME
 * @prop {string} OWNER_PHONE
 * @prop {string} OWNER_EMAIL
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
   * It returns all houses from a persisted person in the database
   * @param {string} countryCode
   * @returns {Promise<HousingsOwner>}
   */
  async getOwnedHousings(countryCode) {
    /** @type {RawOwnedHousing[]} */
    const result = await query`
      SELECT 
        P.PEO_NAME AS OWNER_NAME,
        P.PEO_PHONE AS OWNER_PHONE,
        P.PEO_EMAIL AS OWNER_EMAIL,
        H.*
      FROM people P
        INNER JOIN housing H
          ON H.HOU_PEO_CPF = P.PEO_CPF
      WHERE P.PEO_CPF = ${countryCode}
    `.run();

    const first = result[0];

    /** @type {HousingsOwner} */
    const owner = {
      housings: [],
      countryCode: first.HOU_PEO_CPF,
      email: first.OWNER_EMAIL,
      name: first.OWNER_NAME,
      phone: first.OWNER_PHONE,
    };

    result.forEach((raw) =>
      owner.housings.push({
        id: raw.HOU_ID,
        price: raw.HOU_PRICE,
        title: raw.HOU_TITLE,
        type: raw.HOU_TYPE.split(/,/i).filter(Boolean),
      }),
    );

    return owner;
  }

  /**
   * It creates a person registry
   * @param {Person} person
   * @returns {number}
   */
  async insert({ countryCode, email, name, phone }) {
    const result = await exec`
        INSERT INTO people 
            (PEO_CPF, PEO_EMAIL, PEO_NAME, PEO_PHONE)
        VALUES (${countryCode}, ${email}, ${name}, ${phone})`.run();

    return result.affectedRows;
  }

  /**
   * It updates an exinting person data
   * @param {IdentifiablePerson} person
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
   * It deletes a person data
   * @param {string} countryCode
   * @returns {Promise<number>}
   */
  async delete(countryCode) {
    const result =
      await exec`DELETE FROM people WHERE PEO_CPF = ${countryCode}`.run();

    return result.affectedRows;
  }
}
