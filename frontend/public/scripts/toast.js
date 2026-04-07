class Toast {
  #region;
  #timeout;
  #delay;

  constructor(timeout = 2000, animationDelay = 200) {
    const region = document.getElementById("toast-region");

    if (!region) throw new Error("Unable to initialize toast");

    this.#region = region;
    this.#delay = animationDelay;
    this.#timeout = timeout;
  }

  show(message, type) {
    const toast = document.createElement("div");

    toast.innerHTML = message;
    toast.classList.add("m-toast", `--${type}`);

    this.#region.prepend(toast);

    setTimeout(() => {
      toast.classList.add("--alive");

      setTimeout(() => {
        toast.classList.remove("--alive");

        setTimeout(() => this.#region.removeChild(toast), this.#delay);
      }, this.#timeout - this.#delay);
    }, 100);
  }

  error(message) {
    this.show(message, "error");
  }

  success(message) {
    this.show(message, "success");
  }

  get animationDelay() {
    return this.#delay;
  }

  set animationDelay(value) {
    if (typeof value !== "number" || value >= this.#timeout) return;

    this.#delay = value;
  }

  get timeout() {
    return this.#timeout;
  }

  set timeout(value) {
    if (typeof value !== "number" || value <= this.#delay) return;

    this.#timeout = value;
  }

  static #toast = new Toast(3000, 200);

  static error(message) {
    Toast.#toast.error(message);
  }

  static success(message) {
    Toast.#toast.success(message);
  }
}
