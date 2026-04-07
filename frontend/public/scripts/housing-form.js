class HousingForm {
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
      Toast.error(`Erro de Interface.<br/>Não será possível criar imóveis`);
      return;
    }

    const peopleSelect = this.#form.elements.namedItem("owner");

    if (peopleSelect) {
      fetch("http://localhost:3004/pessoas")
        .then((response) => response.json())
        .then((response) => {
          if (response.error || !Array.isArray(response.data)) {
            Toast.error(
              `Não foi possível carregar pessoas.<br/>${response.error?.message || "Erro inesperado"}`,
            );
            this.#dialog.close();
          } else {
            response.data.forEach((person) => {
              const option = document.createElement("option");

              option.value = person.countryCode;
              option.textContent = person.name;

              peopleSelect.append(option);
            });
          }
        });
    } else {
      Toast.error(`Erro de Interface.<br/>Não foi possível buscar pessoas`);
      this.#dialog.close();
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

    window.addEventListener("housing:edit", (e) => {
      Array.from(this.#form.elements).forEach(
        /**
         * @param {HTMLInputElement} input
         */
        (input) => {
          const name = input.getAttribute("name");

          if (name) {
            const action = {
              owner: () => {
                /** @type {HTMLSelectElement} */
                const select = input;
                select.value = e.detail.owner || "";
                select.disabled = true;
              },
              type: () => (input.value = e.detail.type),
              title: () => (input.value = e.detail.title),
              price: () => (input.value = e.detail.price),
              id: () => (input.value = e.detail.id),
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
      title: (value) => this.#validateTitle(value),
      type: (value) => this.#validateType(value),
      owner: (value) => this.#validateOwner(value),
      price: (value) => this.#validatePrice(value),
    };
  }

  #validateTitle(title) {
    return (
      (title && typeof title === "string" && title.trim().length > 16) ||
      "Título inválido. No mínimo 16 caracteres"
    );
  }

  #validateType(type) {
    return (
      (type && type.trim().split(",").length >= 1) ||
      "Categorias inválidas. Informe ao menos uma"
    );
  }

  #validateOwner(owner) {
    return (owner && owner.trim().length === 11) || "Selecione um dono";
  }

  #validatePrice(value) {
    if (!value) return "Preço deve ser numérico";

    const parsed = parseFloat(value);

    if (isNaN(parsed)) return "Preço deve ser numérico";

    if (parsed < 10000 || parsed > 999999999)
      return "O preço deve ser entre 10000 e 999999999";

    return true;
  }

  /**
   * @param {SubmitEvent} e
   */
  #handleSubmit(e) {
    e.preventDefault();

    if (this.#form.checkValidity()) {
      const button = this.#form.querySelector("button[type=submit]");
      const data = new FormData(this.#form);
      const action = this.#isEditing ? "alterar" : "adicionar";

      button.classList.add("--loading");

      fetch(
        ...(this.#isEditing
          ? [
              "http://localhost:3004/imoveis/" + data.get("id"),
              {
                method: "PUT",
                body: JSON.stringify({
                  title: data.get("title"),
                  price: parseFloat(data.get("price")),
                  type: data.get("type"),
                }),
                headers: {
                  "Content-Type": "application/json; charset=utf-8",
                },
              },
            ]
          : [
              "http://localhost:3004/imoveis",
              {
                method: "POST",
                body: JSON.stringify({
                  title: data.get("title"),
                  price: parseFloat(data.get("price")),
                  type: data.get("type"),
                  owner: data.get("owner"),
                }),
                headers: {
                  "Content-Type": "application/json; charset=utf-8",
                },
              },
            ]),
      )
        .catch((e) => {
          Toast.error(
            `Erro ao ${action} imóvel.<br />${e?.message ?? "Tente novamente mais tarde"}`,
          );
        })
        .then((response) => response.json())
        .then((response) => {
          if (response.error) {
            Toast.error(
              `Erro ao ${action} imóvel.<br />${response.error.message ?? "Tente novamente mais tarde"}`,
            );
          } else {
            Toast.success(`Sucesso ao ${action} imóvel`);
            this.#close();
            setTimeout(() => location.reload(), Toast.timeout);
          }
        })
        .finally(() => {
          button.classList.remove("--loading");
        });
    }
  }

  #close() {
    this.#form.reset();
    this.#dialog.close();
    Array.from(this.#form.elements).forEach((i) => {
      if (i.disabled) i.disabled = false;
    });
    this.#isEditing = false;
    this.#dialog.querySelectorAll(".form-action-label").forEach((label) => {
      label.textContent = "Adicionar";
    });
  }
}

const housingFormEl = document.querySelector("dialog#housing-form");
const createHounsingBtn = document.querySelector(
  ".create-wrapper.--housings button[type='button']",
);

if (housingFormEl && createHounsingBtn) {
  const housingForm = new HousingForm(housingFormEl);

  createHounsingBtn.addEventListener("click", () => {
    housingForm.create();
  });
} else {
  Toast.error(
    "Erro de interface.<br/>Não foi possível criar formulário de imóvel",
  );
}
