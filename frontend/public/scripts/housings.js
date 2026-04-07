const housingsList = document.getElementById("housing");

if (housingsList)
  fetch("http://localhost:3004/imoveis")
    .catch((error) =>
      Toast.error(
        `Falha ao carregar imóveis.<br/>${error?.message ?? "Erro Inesperado"}`,
      ),
    )
    .then((response) => response.json())
    .then(({ data, error }) => {
      if (!data || !data.length || (error && error.message)) {
        Toast.error(error.message);
      } else {
        Toast.success("Imóveis encontrados");

        data.forEach((housing) => {
          const li = document.createElement("li");
          const element = document.createElement("pim-housing");

          element.housingId = parseInt(housing.id);
          element.housingTitle = housing.title;
          element.owner = housing.owner;
          element.price = parseFloat(housing.price);
          element.types = housing.type;

          li.append(element);
          housingsList.append(li);
        });
      }
    })
    .finally(() => housingsList.classList.remove("--loading"));
