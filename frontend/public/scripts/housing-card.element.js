const HOUSING_CARD_TEMPLATE = document.querySelector("template#housing-card");

if (HOUSING_CARD_TEMPLATE) {
  class HousingCardElement extends HTMLElement {
    #id;
    #price;
    #types;
    #title;
    #ownerId;
    #ownerName;

    constructor() {
      super();

      this.#id = null;
      this.#price = null;
      this.#types = null;
      this.#title = null;
      this.#ownerId = null;
      this.#ownerName = null;

      const clone = HOUSING_CARD_TEMPLATE.content.cloneNode(true);

      this.attachShadow({ mode: "open" });

      this.shadowRoot.append(clone);
    }

    connectedCallback() {
      const deleteButton = this.shadowRoot.querySelector(
        ".actions button.delete",
      );

      if (deleteButton) {
        deleteButton.addEventListener("click", () => {
          if (!this.#id) {
            Toast.error(`Erro ao deletar imóvel "${this.#title}"`);
            return;
          }

          fetch("http://localhost:3004/imoveis/" + this.#id, {
            method: "DELETE",
          })
            .then((response) => response.json())
            .then((response) => {
              if (response.error || !response.data) {
                if (response.error.message) {
                  Toast.error(
                    `Erro ao deletar imóvel #${this.#id}<br/>${response.error.message}`,
                  );
                } else
                  Toast.error(
                    `Erro ao deletar imóvel #${this.#id}<br/>Erro inesperado`,
                  );
              } else {
                Toast.success(`Imóvel #${this.#id} deletado com sucesso!`);
                setTimeout(() => location.reload(), Toast.delay);
              }
            })
            .catch((error) => {
              if (error.message)
                Toast.error(
                  `Erro ao deletar imóvel #${this.#id}<br/>${error.message}`,
                );
              else
                Toast.error(
                  `Erro ao deletar imóvel #${this.#id}<br/>Erro inesperado`,
                );
            });
        });
      }
    }

    get housingId() {
      if (!this.#id) return null;

      return this.#id;
    }

    set housingId(id) {
      if (typeof id !== "number") return;

      this.#id = id;
    }

    get ownerId() {
      if (!this.#ownerId) return null;

      return this.#ownerId;
    }

    get types() {
      return this.#types;
    }

    set types(value) {
      if (!value || !Array.isArray(value) || !value.length) return;

      this.#types = structuredClone(value);

      value.forEach((type) => {
        const typeEl = document.createElement("span");

        typeEl.slot = "type";
        typeEl.textContent = type;

        this.append(typeEl);
      });
    }

    get price() {
      return this.#price;
    }

    set price(value) {
      if (typeof value !== "number") return;

      this.#price = value;

      const price = document.createElement("span");

      price.textContent = parseFloat(this.#price).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        currencyDisplay: "symbol",
      });
      price.slot = "price";

      this.append(price);
    }

    get housingTitle() {
      return this.#title;
    }

    set housingTitle(value) {
      if (!value || typeof value !== "string") return;

      this.#title = value;

      const titleEl = document.createElement("span");

      titleEl.textContent = this.#title;
      titleEl.slot = "title";

      this.append(titleEl);
    }

    get ownerName() {
      return this.#ownerName;
    }

    set owner(value) {
      if (
        !value ||
        typeof value !== "object" ||
        !("countryCode" in value) ||
        !("name" in value)
      )
        return;

      this.#ownerName = value;

      const owner = document.createElement("a");

      owner.textContent = this.#ownerName.name;
      owner.href = `/pessoa?code=${this.#ownerName.countryCode}`;
      owner.slot = "owner";

      this.append(owner);
    }
  }

  window.HousingCardElement = HousingCardElement;

  customElements.define("pim-housing", HousingCardElement);
} else {
  Toast.error("Falha de interface: template do card de imóvel não encontrado");
}
