const peopleList = document.getElementById("people");
const housingsList = document.getElementById("housing");
const code = new URL(location.href).searchParams.get("code");

if (peopleList && housingsList && code && typeof code === "string") {
  fetch(`http://localhost:3004/pessoas/${code}/imoveis`)
    .catch((error) =>
      Toast.error(
        `Falha ao carregar imovéis.<br/>${error?.message ?? "Erro Inesperado"}`,
      ),
    )
    .then((response) => response.json())
    .then(({ data, error }) => {
      if (!data || (error && error.message)) {
        Toast.error(
          `Falha ao carregar imovéis.<br/>${error?.message ?? "Erro Inesperado"}`,
        );
      } else {
        Toast.success("Imóveis encontrados");

        const person = data;

        const li = document.createElement("li");
        const element = document.createElement("pim-person");

        element.code = person.countryCode;
        element.personName = person.name;
        element.email = person.email;
        element.phone = person.phone;

        li.append(element);
        peopleList.append(li);

        const housings = person.housings;

        if (!housings || !housings.length) {
          Toast.error(
            `Nenhum imóvel encontrado para a pessoa #${person.countryCode}`,
          );
          return;
        }

        housingsList.style.marginTop = "1.6rem";

        housings.forEach((housing) => {
          const li = document.createElement("li");
          const element = document.createElement("pim-housing");

          element.housingId = parseInt(housing.id);
          element.housingTitle = housing.title;
          element.owner = person;
          element.price = parseFloat(housing.price);
          element.types = housing.type;

          li.append(element);
          housingsList.append(li);
        });
      }
    })
    .finally(() => {
      peopleList.classList.remove("--loading");
      housingsList.classList.remove("--loading");
    });
} else {
  Toast.error("Falha de interface");
}
