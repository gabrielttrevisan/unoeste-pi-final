class PersonForm {
  /** @type {HTMLDialogElement} */
  #dialog;
  /** @type {HTMLFormElement} */
  #form;
  #isEditing = false;

  constructor(dialog) {
    this.#dialog = dialog;
    this.#form = dialog.querySelector("form");

    this.#init();
  }

  #init() {
    if (!this.#form) {
      Toast.error(`Erro de Interface.<br/>Não será possível criar pessoas`);
      return;
    }

    this.#form.addEventListener("submit", (e) => this.#handleSubmit(e));

    const validationByName = this.validationByName;

    Array.from(this.#form.elements).forEach((element) => {
      const name = element.getAttribute("name");
      const validate = validationByName[name];

      if (name && validate)
        element.addEventListener("input", () => {
          const result = validate(element.value);
          const formInput = element.closest(".form-input");
          const errorMessage = formInput?.querySelector(".error-message");

          if (typeof result === "string") {
            element.setCustomValidity(result);
            if (formInput) formInput.classList.add("--invalid");
            if (errorMessage) errorMessage.textContent = result;
          } else {
            element.setCustomValidity("");
            if (formInput) formInput.classList.remove("--invalid");
            if (errorMessage) errorMessage.textContent = "";
          }
        });
    });

    window.addEventListener("person:edit", (e) => {
      Array.from(this.#form.elements).forEach(
        /**
         * @param {HTMLInputElement} input
         */
        (input) => {
          const name = input.getAttribute("name");

          if (name) {
            const action = {
              cpf: () => {
                input.value = e.detail.code;
                input.readOnly = true;
              },
              name: () => (input.value = e.detail.name),
              email: () => (input.value = e.detail.email),
              phone: () => (input.value = e.detail.phone),
            }[name];

            if (action) action();
          }
        },
      );

      this.#dialog.showModal();
      this.#isEditing = true;

      this.#dialog.querySelectorAll(".form-action-label").forEach((label) => {
        label.textContent = "Editar";
      });
    });

    const closeButton = this.#dialog.querySelector(
      "button[type='button'].close-dialog",
    );

    if (closeButton) {
      closeButton.addEventListener("click", () => this.#close());
    }
  }

  create() {
    this.#dialog.showModal();
  }

  get validationByName() {
    return {
      name: (value) => this.#validateName(value),
      email: (value) => this.#validateEmail(value),
      cpf: (value) => this.#validateCPF(value),
      phone: (value) => this.#validatePhone(value),
    };
  }

  #validateName(name) {
    return (
      (name &&
        typeof name === "string" &&
        name.match(/([a-z\-]{2,})\s+([a-z\-]{2,})/i) !== null &&
        name.match(/-{2,}/g) === null) ||
      "Nome inválido"
    );
  }

  #validateEmail(email) {
    return (
      (email &&
        typeof email === "string" &&
        email
          .trim()
          .match(/([a-z][a-z\-\.0-9]+[a-z0-9])@([a-z][a-z0-9\.]+[a-z])/i) !==
          null) ||
      "E-mail inválido"
    );
  }

  #validateCPF(cpf) {
    return (
      (cpf &&
        typeof cpf === "string" &&
        cpf.match(/^(\d{3})\.?(\d{3})\.?(\d{3})-?(\d{2})$/) !== null &&
        this.#isCountryCodeValid(cpf.trim())) ||
      "CPF inválido"
    );
  }

  #isCountryCodeValid(value) {
    const match = value.match(/^(\d{9})-?(\d{2})$/);

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

  #validatePhone(phone) {
    return (
      (phone &&
        typeof phone === "string" &&
        phone.trim().match(/^\(?(\d{2})\)?\s?(\d{4,5})-?(\d{4})$/)) ||
      "Telefone inválido"
    );
  }

  /**
   * @param {SubmitEvent} e
   */
  #handleSubmit(e) {
    e.preventDefault();

    if (this.#form.checkValidity()) {
      const button = this.#form.querySelector("button[type=submit]");
      const data = new FormData(this.#form);
      const action = this.#isEditing ? "alterar" : "criar";

      button.classList.add("--loading");

      fetch(
        ...(this.#isEditing
          ? [
              "http://localhost:3004/pessoas/" + data.get("cpf"),
              {
                method: "PUT",
                body: JSON.stringify({
                  name: data.get("name"),
                  email: data.get("email"),
                  phone: data.get("phone"),
                }),
                headers: {
                  "Content-Type": "application/json; charset=utf-8",
                },
              },
            ]
          : [
              "http://localhost:3004/pessoas",
              {
                method: "POST",
                body: JSON.stringify({
                  cpf: data.get("cpf"),
                  name: data.get("name"),
                  email: data.get("email"),
                  phone: data.get("phone"),
                }),
                headers: {
                  "Content-Type": "application/json; charset=utf-8",
                },
              },
            ]),
      )
        .catch((e) => {
          Toast.error(
            `Erro ao ${action} pessoa.<br />${e?.message ?? "Tente novamente mais tarde"}`,
          );
        })
        .then((response) => response.json())
        .then((response) => {
          if (response.error) {
            Toast.error(
              `Erro ao ${action} pessoa.<br />${response.error.message ?? "Tente novamente mais tarde"}`,
            );
          } else {
            Toast.success(`Sucesso ao ${action} pessoa`);
          }
        })
        .finally(() => {
          button.classList.remove("--loading");
          this.#close();
          setTimeout(() => location.reload(), Toast.timeout);
        });
    }
  }

  #close() {
    this.#form.reset();
    this.#dialog.close();
    Array.from(this.#form.elements).forEach((i) => {
      if (i.readOnly) i.readOnly = false;
    });
    this.#isEditing = false;
    this.#dialog.querySelectorAll(".form-action-label").forEach((label) => {
      label.textContent = "Criar";
    });
  }
}

const personFormEl = document.querySelector("dialog#person-form");
const createPersonBtn = document.querySelector(
  ".create-wrapper.--person button[type='button']",
);

if (personFormEl && createPersonBtn) {
  const personForm = new PersonForm(personFormEl);

  createPersonBtn.addEventListener("click", () => {
    personForm.create();
  });
} else {
  Toast.error("Erro de interface");
}
