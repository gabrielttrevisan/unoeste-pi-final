import { PersonEntity } from "../entities/person.entity.js";

export class PersonModel {
  /** @type {string} */
  #contryCode;
  /** @type {string|undefined} */
  #name;
  /** @type {string|undefined} */
  #phone;
  /** @type {string|undefined} */
  #email;
  /** @type {import("../entities/person.entity").OwnedHousing[]} */
  #housings;

  /**
   * @param {import("../entities/person.entity").IdentifiablePerson} person
   */
  constructor({ countryCode, email, name, phone } = { countryCode: "all" }) {
    if (!countryCode)
      throw new Error("PersonModel needs the contry code to be specified");

    this.#contryCode = countryCode;
    this.#email = email;
    this.#name = name;
    this.#phone = phone;
    this.#housings = [];
  }

  async getAll() {
    const entity = new PersonEntity();

    return (await entity.getAll()).map((person) => new PersonModel(person));
  }

  async getHousings() {
    const entity = new PersonEntity();
    const owner = await entity.getOwnedHousings(this.#contryCode);

    this.#housings.push(...owner.housings);

    this.#email = owner.email;
    this.#phone = owner.phone;
    this.#name = owner.name;

    return this.serialize();
  }

  async create() {
    const entity = new PersonEntity();

    return await entity.insert({
      countryCode: this.#contryCode,
      email: this.#email,
      name: this.#name,
      phone: this.#phone,
    });
  }

  async update() {
    const entity = new PersonEntity();

    return await entity.update({
      countryCode: this.#contryCode,
      email: this.#email,
      name: this.#name,
      phone: this.#phone,
    });
  }

  async delete() {
    const entity = new PersonEntity();

    return await entity.delete(this.#contryCode);
  }

  /**
   * @returns {import("../entities/person.entity").HousingsOwner}
   */
  serialize() {
    if (!this.#phone || !this.#email || !this.#name)
      throw new Error(`Person #${this.#contryCode} is not serializable`);

    return {
      countryCode: this.#contryCode,
      email: this.#email,
      name: this.#name,
      phone: this.#phone,
      housings: this.#housings,
    };
  }

  #isCountryCodeValid() {
    const match = this.#contryCode.match(/^(\d{9})-?(\d{2})$/);

    if (!match) return false;

    const [, first, last] = match;

    if (!first || first.length < 9 || !last || last.length < 2) return false;

    const numbers = first
      .split("")
      .map(Number)
      .filter((n) => !isNaN(n));

    if (numbers.length < 9) return false;

    let sum = 0;
    let firstMark;

    for (let i = 1; i <= 9; i++) {
      sum = sum + numbers[i - 1] * (11 - i);
    }

    firstMark = (sum * 10) % 11;

    if (firstMark === 10 || firstMark === 11) {
      firstMark = 0;
    }

    if (firstMark.toString() !== last[0]) {
      return false;
    }

    numbers.push(firstMark);

    let lastMark;

    sum = 0;

    for (let i = 1; i <= 10; i++) {
      sum += numbers[i - 1] * (12 - i);
    }

    lastMark = (sum * 10) % 11;

    if (lastMark === 10 || lastMark === 11) {
      lastMark = 0;
    }

    if (lastMark.toString() !== last[1]) {
      return false;
    }

    return true;
  }

  clear() {
    if (this.#contryCode)
      this.#contryCode = this.#contryCode.replace(/[^\dX]/g, "").toUpperCase();
    if (this.#name) this.#name = this.#name.trim().replace(/\s{2,}/g, " ");
    if (this.#email) this.#email = this.#email.trim().toLowerCase();
    if (this.#phone) this.#phone = this.#phone.replace(/\D/g, "");
  }

  get isCountryCodeValid() {
    return (
      this.#contryCode &&
      this.#contryCode.match(/^(\d{3})\.?(\d{3})\.?(\d{3})-?(\d{2})$/) !==
        null &&
      this.#isCountryCodeValid()
    );
  }

  get isPhoneValid() {
    return (
      this.#phone &&
      this.#phone.match(/^\(?(\d{2})\)?\s?(\d{4,5})-?(\d{4})$/) !== null
    );
  }

  get isNameValid() {
    return (
      this.#name &&
      this.#name.match(/([a-z\-]{2,})\s+([a-z\-]{2,})/i) !== null &&
      this.#name.match(/-{2,}/g) === null
    );
  }

  get isEmailValid() {
    return (
      this.#email &&
      this.#email.match(
        /([a-z][a-z\-\.0-9]+[a-z0-9])@([a-z][a-z0-9\.]+[a-z])/i,
      ) !== null
    );
  }

  get validity() {
    let isValid = true;
    const invalidFields = [];

    if (!this.isCountryCodeValid) {
      invalidFields.push("CPF");
      isValid = false;
    }

    if (!this.isPhoneValid) {
      invalidFields.push("Telefone");
      isValid = false;
    }

    if (!this.isNameValid) {
      invalidFields.push("Nome");
      isValid = false;
    }

    if (!this.isEmailValid) {
      invalidFields.push("E-mail");
      isValid = false;
    }

    return {
      isValid,
      invalidFields,
    };
  }
}
