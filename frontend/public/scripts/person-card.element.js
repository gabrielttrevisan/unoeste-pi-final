const PERSON_CARD_TEMPLATE = document.querySelector("template#person-card");

if (PERSON_CARD_TEMPLATE) {
  class PersonCardElement extends HTMLElement {
    #code;
    #name;
    #email;
    #phone;

    constructor() {
      super();

      this.#code = null;
      this.#name = null;
      this.#email = null;
      this.#phone = null;

      const clone = PERSON_CARD_TEMPLATE.content.cloneNode(true);

      this.attachShadow({ mode: "open" });

      this.shadowRoot.append(clone);
    }

    connectedCallback() {
      const deleteButton = this.shadowRoot.querySelector(
        ".actions button.delete",
      );

      if (deleteButton) {
        deleteButton.addEventListener("click", () => {
          if (!this.#code) {
            Toast.error(`Erro ao deletar imóvel "${this.#name}"`);
            return;
          }

          fetch("http://localhost:3004/pessoas/" + this.#code, {
            method: "DELETE",
          })
            .then((response) => response.json())
            .then((response) => {
              if (response.error || !response.data) {
                if (response.error.message) {
                  Toast.error(
                    `Erro ao deletar pessoa #${this.#code}<br/>${response.error.message}`,
                  );
                } else
                  Toast.error(
                    `Erro ao deletar pessoa #${this.#code}<br/>Erro inesperado`,
                  );
              } else {
                Toast.success(`Pessoa #${this.#code} deletada com sucesso!`);
                setTimeout(() => location.reload(), Toast.delay);
              }
            })
            .catch((error) => {
              if (error.message)
                Toast.error(
                  `Erro ao deletar pessoa #${this.#code}<br/>${error.message}`,
                );
              else
                Toast.error(
                  `Erro ao deletar pessoa #${this.#code}<br/>Erro inesperado`,
                );
            });
        });
      }
    }

    get code() {
      if (!this.#code) return null;

      return this.#code;
    }

    set code(id) {
      if (!id || typeof id !== "string") return;

      this.#code = id;

      const codeEl = document.createElement("span");

      codeEl.textContent = this.#code.replace(
        /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
        "$1.$2.$3-$4",
      );
      codeEl.slot = "code";

      this.append(codeEl);
    }

    get personName() {
      return this.#name;
    }

    set personName(value) {
      if (!value || typeof value !== "string") return;

      this.#name = value;

      const titleEl = document.createElement("span");

      titleEl.textContent = this.#name;
      titleEl.slot = "name";

      this.append(titleEl);
    }

    get phone() {
      if (!this.#phone) return null;

      return this.#phone;
    }

    set phone(phone) {
      if (!phone || typeof phone !== "string") return;

      this.#phone = phone;

      const phoneEl = document.createElement("span");

      phoneEl.textContent = this.#phone.replace(
        /^(\d{2})(\d{4,5})(\d{4})$/,
        "($1) $2-$3",
      );
      phoneEl.slot = "phone";

      this.append(phoneEl);
    }

    get email() {
      if (!this.#email) return null;

      return this.#email;
    }

    set email(email) {
      if (!email || typeof email !== "string") return;

      this.#email = email;

      const emailEl = document.createElement("span");

      emailEl.textContent = this.#email;
      emailEl.slot = "email";

      this.append(emailEl);
    }
  }

  window.PersonCardElement = PersonCardElement;

  customElements.define("pim-person", PersonCardElement);
} else {
  Toast.error("Falha de interface: template do card de pessoa não encontrado");
}
