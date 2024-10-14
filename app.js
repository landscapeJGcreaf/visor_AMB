// Inicializar el mapa centrado en el AMBarcelona
var map = L.map('map').setView([41.34657, 2.14325], 11);

// Capa base OpenStreetMap
var osmLayer = L.tileLayer('https://tile.openstreetmap.bzh/ca/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles courtesy of <a href="https://www.openstreetmap.cat" target="_blank">Breton OpenStreetMap Team</a>'
});

// Afegir la capa base al mapa
osmLayer.addTo(map);

// Afegir WMS ortofoto Catalunya 25cm 2023 
var wmsLayer = L.tileLayer.wms('http://geoserveis.icgc.cat/icc_ortohistorica/wms/service?', {
    layers: 'orto25c2018', // Cambia por el nombre de la capa WMS que deseas mostrar
    format: 'image/png',
    transparent: true,
    attribution: 'Dades proporcionades per <a href="https://www.icgc.cat/ca">Institut Cartogràfic i Geològic de Catalunya</a>',
});

// Inicializar variables para almacenar las capas GeoJSON
let geoJsonLayer;
let ambitAmbLayer;

// Cargar el archivo GeoJSON ambit_amb
fetch('data/ambit_amb.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar el archivo ambit_amb.geojson');
        }
        return response.json();
    })
    .then(data => {
        console.log('Datos de ambit_amb:', data); // Depuración
        // Crear la capa GeoJSON para ambit_amb
        ambitAmbLayer = L.geoJSON(data, {
            style: {
                color: '#de1a13', // Color de los límites o contornos
                weight: 2,
                opacity: 1,
                fillColor: '#82a217',
            },
            onEachFeature: function (feature, layer) {
                // Añadir información de popup, si es necesario
                layer.bindPopup('<b>Ambit AMB:</b> ' + feature.properties.nombre); // Ajusta el nombre de la propiedad según tu GeoJSON
            }
        });

        ambitAmbLayer.addTo(map); // Añadir la capa al mapa si es necesario

        // Ahora cargar el archivo GeoJSON de puntos
        return fetch('data/malla_revisions_2023.geojson');
    })
    .then(response => response.json())
    .then(data => {
        // Función para definir el estilo de los puntos
        function style(feature) {
            var value = feature.properties.revisio;

            if (value === 0) {
                return {
                    radius: 4,
                    fillColor: '#82a217',
                    color: '#232323',
                    weight: 0.5,
                    opacity: 1,
                    fillOpacity: 0.9
                };
            } else if (value === 2) {
                return {
                    radius: 4,
                    fillColor: '#e31a1c',
                    color: '#000000',
                    weight: 0.5,
                    opacity: 1,
                    fillOpacity: 0.9
                };
            }
        }

        // Crear el GeoJSON layer para los puntos de revisión
        geoJsonLayer = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, style(feature)); // Usar circleMarker para puntos redondos
            },
            onEachFeature: function (feature, layer) {
                // Mostrar las propiedades 'nom_simple' y 'revision' en el popup
                layer.bindPopup('<b>Categoria nom_simple:</b> ' + feature.properties.nom_simple + '<br>' +
                                '<b>Categoria revisió:</b> ' + feature.properties.revision);
            }
        });

        // Añadir la capa geoJsonLayer al mapa si es necesario
        geoJsonLayer.addTo(map);

        // Crear un objeto para las capas overlay
        var overlayMaps = {
            "Malla revisions 2023": geoJsonLayer,
            "Àmbit AMB": ambitAmbLayer,
            "Ortofoto de Catalunya color any 2018": wmsLayer,
        };

        // Añadir el control de capas al mapa
        var layersControl = L.control.layers({
            "Mapa base OpenStreetMap": osmLayer
        }, overlayMaps).addTo(map);

        // Abrir el control de capas por defecto
        layersControl.expand();
    })
    .catch(error => {
        console.error('Error al cargar los archivos GeoJSON:', error);
    });

       
// Crear un botón para volver al zoom inicial
var zoomHomeButton = L.control({ position: 'topleft' });

zoomHomeButton.onAdd = function () {
    var div = L.DomUtil.create('div', 'zoom-home-button');
    div.innerHTML = '<button title="Zoom inicial" style="background-color: white; border: 1px solid #ccc; padding: 5px; border-radius: 5px; cursor: pointer;"><i class="fas fa-home"></i></button>';
    div.onclick = function () {
        map.setView([41.34657, 2.14325], 11); // Cambia la posición y el zoom inicial si es necesario
    };
    return div;
};

zoomHomeButton.addTo(map);

// Inicializar el control de búsqueda por municipio
var geocoder = L.Control.geocoder({
    defaultMarkGeocode: false
});

// Crear el contenedor del control de búsqueda
var geocoderControl = L.control({ position: 'bottomleft' });

geocoderControl.onAdd = function (map) {
    var container = L.DomUtil.create('div', 'geocoder');
    container.setAttribute('title', 'Cerca per municipi'); // Añadir el atributo title
    container.appendChild(geocoder.onAdd(map)); // Añadir el control de búsqueda al contenedor
    return container;
};

// Añadir el control de búsqueda al mapa
geocoderControl.addTo(map);

// Agregar un evento para manejar la búsqueda
geocoder.on('markgeocode', function (e) {
    var bbox = e.geocode.bbox;
    map.fitBounds(bbox);
});

// Asegurarse de que el botón de inicio esté debajo del control de zoom
zoomHomeButton.addTo(map);


