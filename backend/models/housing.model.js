import { HousingEntity } from "../entities/housing.entity.js";
import { PersonModel } from "./person.model.js";

/**
 * @typedef {Object} PartialHousing
 * @prop {number} [id]
 * @prop {string} [title]
 * @prop {string} [type]
 * @prop {number} [price]
 * @prop {string|import("../models/person.model.js").PersonModel} [owner]
 */

export class HousingModel {
  /** @type {number | null} */
  #id;
  /** @type {string | null} */
  #title;
  /** @type {string[] | null} */
  #type;
  /** @type {number | null} */
  #price;
  /** @type {string | import("../models/person.model.js").PersonModel | null} */
  #owner;

  /**
   *
   * @param {PartialHousing} [housing]
   */
  constructor({ id, title, type, price, owner } = {}) {
    this.#id = id ?? null;
    this.#title = title ?? null;
    this.#type = Array.isArray(type)
      ? type
      : typeof type === "string"
        ? type.split(/,/)
        : null;
    this.#price = price ?? null;
    this.#owner = owner ?? null;
  }

  async getAll() {
    const entity = new HousingEntity();
    const result = await entity.getAll();

    return result.map(
      (housing) =>
        new HousingModel({
          ...housing,
          owner: new PersonModel(housing.owner),
        }),
    );
  }

  /**
   * @returns {Promise<import("../entities/housing.entity").PersistedHousing>}
   */
  async create() {
    const entity = new HousingEntity();
    const id = await entity.insert({
      owner: this.#owner,
      price: this.#price,
      title: this.#title,
      type: this.#type.join(","),
    });

    this.#id = id;

    return {
      id,
      owner: this.#owner,
      price: this.#price,
      title: this.#title,
      type: this.#type,
    };
  }

  get isIDValid() {
    return this.#id && typeof this.#id === "number" && this.#id > 0;
  }

  get isPriceValid() {
    return this.#price && typeof this.#price === "number" && this.#price > 10000;
  }

  get isTitleValid() {
    return (
      this.#title &&
      typeof this.#title === "string" &&
      this.#title.trim().length > 16
    );
  }

  get isCountryCodeValid() {
    if (this.#owner instanceof PersonModel)
      return this.#owner.isCountryCodeValid;

    if (typeof this.#owner === "string")
      return new PersonModel({ countryCode: this.#owner }).isCountryCodeValid;

    return false;
  }

  get isTypeValid() {
    return (
      this.#type &&
      Array.isArray(this.#type) &&
      this.#type.every(
        (type) => typeof type === "string" && type.trim().length > 0,
      )
    );
  }

  get validity() {
    let isValid = true;
    const invalidFields = [];

    if (!this.isPriceValid) {
      isValid = false;
      invalidFields.push("Preço");
    }

    if (!this.isTitleValid) {
      isValid = false;
      invalidFields.push("Título");
    }

    if (!this.isTypeValid) {
      isValid = false;
      invalidFields.push("Tipo");
    }

    if (!this.isCountryCodeValid) {
      isValid = false;
      invalidFields.push("CPF");
    }

    return {
      isValid,
      invalidFields,
    };
  }

  /**
   * @returns {import("../entities/housing.entity").PersistedHousing}
   */
  serialize() {
    if (
      !this.#id ||
      !this.#owner ||
      !(this.#owner instanceof PersonModel) ||
      !this.#title ||
      !this.#type
    )
      throw new Error("HousingModel is not serializable");

    return {
      id: this.#id,
      owner: this.#owner.serialize(),
      price: this.#price,
      title: this.#title,
      type: this.#type,
    };
  }
}
