document.addEventListener('DOMContentLoaded', function () {
    Papa.parse('data/dades_canvi.csv', {
        download: true,
        header: true,
        complete: function (results) {
            const data = results.data;

            // Agregar filas a la tabla usando los datos del CSV
            const tableBody = document.querySelector("#data-table tbody");
            data.forEach(row => {
                // Verificar que la fila tenga todos los campos necesarios
                if (row.nom_simple_2020 && row.nom_simple_2023) {
                    const newRow = document.createElement("tr");
                    newRow.innerHTML = `
                        <td>${row.nom_simple_2020}</td>
                        <td>${row.nom_simple_2023}</td>
                    `;
                    tableBody.appendChild(newRow);
                }
            });
        },
        error: function (error) {
            console.error('Error al cargar el archivo CSV:', error);
        }
    });
});
