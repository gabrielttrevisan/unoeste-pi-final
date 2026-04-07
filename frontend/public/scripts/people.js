const peopleList = document.getElementById("people");

if (peopleList)
  fetch("http://localhost:3004/pessoas")
    .catch((error) =>
      Toast.error(
        `Falha ao carregar pessoas.<br/>${error?.message ?? "Erro Inesperado"}`,
      ),
    )
    .then((response) => response.json())
    .then(({ data, error }) => {
      if (!data || !data.length || (error && error.message)) {
        Toast.error(error.message);
      } else {
        Toast.success("Pessoas encontradas");

        data.forEach((person) => {
          const li = document.createElement("li");
          const element = document.createElement("pim-person");

          element.code = person.countryCode;
          element.personName = person.name;
          element.email = person.email;
          element.phone = person.phone;

          li.append(element);
          peopleList.append(li);
        });
      }
    })
    .finally(() => peopleList.classList.remove("--loading"));
