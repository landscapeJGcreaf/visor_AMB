// Inicializar el mapa centrado en el AMBarcelona
var map = L.map('map').setView([41.34657, 2.14325], 11);

// Capa base OpenStreetMap
var osmLayer = L.tileLayer('https://tile.openstreetmap.bzh/ca/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles courtesy of <a href="https://www.openstreetmap.cat" target="_blank">Breton OpenStreetMap Team</a>'
});

// Añadir la capa base al mapa
osmLayer.addTo(map);

// Añadir WMS ortofoto Catalunya 25cm 2023 
var wmsLayer = L.tileLayer.wms('https://geoserveis.icgc.cat/servei/catalunya/orto-territorial/wms?', {
    layers: 'ortofoto_25cm_color_2023',
    format: 'image/png',
    transparent: true,
    attribution: 'Dades proporcionades per <a href="https://www.icgc.cat/ca">Institut Cartogràfic i Geològic de Catalunya</a>',
});

// Inicializar variables para almacenar las capas GeoJSON y la leyenda
let geoJsonLayer;
let ambitAmbLayer;
let legend; // Definimos la variable legend fuera de la función

// Cargar el archivo GeoJSON ambit_amb
fetch('data/ambit_amb.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al cargar el archivo ambit_amb.geojson');
        }
        return response.json();
    })
    .then(data => {
        ambitAmbLayer = L.geoJSON(data, {
            style: {
                color: '#de1a13',
                weight: 2.5,
                opacity: 1,
                fillColor: '#82a217',
                fillOpacity: 0
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<b>Ambit AMB:</b> ' + feature.properties.nombre);
            }
        });

        ambitAmbLayer.addTo(map);

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

        // Crear la capa GeoJSON para los puntos de revisión
        geoJsonLayer = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, style(feature));
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<b>Categoria nom_simple:</b> ' + feature.properties.nom_simple + '<br>' +
                                '<b>Categoria revisió:</b> ' + feature.properties.revision);
            }
        });

        // Función para mostrar la leyenda al activar la capa desde el panel de control de capas
        function showLegend() {
            // Eliminar la leyenda existente, si ya está presente
            if (legend) {
                map.removeControl(legend);
            }

            // Crear la nueva leyenda
            legend = L.control({ position: 'bottomright' });

            legend.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'info legend');
                var categories = [0, 2];
                var labels = ['#82a217', '#e31a1c'];
                var descriptions = ['Sense canvi', 'Canvi coberta'];

                div.innerHTML = '<strong>Canvi cobertes 2023</strong><br>';

                for (var i = 0; i < categories.length; i++) {
                    div.innerHTML +=
                        '<i style="background:' + labels[i] + '"></i> ' +
                        descriptions[i] + '<br>';
                }

                return div;
            };

            legend.addTo(map);
        }

        // Crear un objeto para las capas overlay
        var overlayMaps = {
            "Malla revisions 2023": geoJsonLayer,
            "Àmbit AMB": ambitAmbLayer,
            "Ortofoto de Catalunya 2023": wmsLayer,
        };

        // Añadir el control de capas al mapa
        var layersControl = L.control.layers({
            "Mapa base OpenStreetMap": osmLayer
        }, overlayMaps).addTo(map);

        layersControl.expand();

        // Evento que se dispara cuando se activa la capa "Malla revisions 2023"
        map.on('overlayadd', function (eventLayer) {
            if (eventLayer.name === "Malla revisions 2023") {
                showLegend();  // Mostrar la leyenda cuando se activa la capa
            }
        });

        // Evento que se dispara cuando se desactiva la capa "Malla revisions 2023"
        map.on('overlayremove', function (eventLayer) {
            if (eventLayer.name === "Malla revisions 2023") {
                if (legend) {
                    map.removeControl(legend);  // Eliminar la leyenda cuando se desactiva la capa
                }
            }
        });

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
        map.setView([41.34657, 2.14325], 11);
    };
    return div;
};

zoomHomeButton.addTo(map);

// Inicializar el control de búsqueda por municipio
var geocoder = L.Control.geocoder({
    defaultMarkGeocode: false
});

var geocoderControl = L.control({ position: 'bottomleft' });

geocoderControl.onAdd = function (map) {
    var container = L.DomUtil.create('div', 'geocoder');
    container.setAttribute('title', 'Cerca per municipi');
    container.appendChild(geocoder.onAdd(map));
    return container;
};

geocoderControl.addTo(map);

geocoder.on('markgeocode', function (e) {
    var bbox = e.geocode.bbox;
    map.fitBounds(bbox);
});

zoomHomeButton.addTo(map);




