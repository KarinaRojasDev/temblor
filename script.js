
async function getEarthquakes(){
    let res = await fetch(`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`);
    let data = await  res.json();

    const terremotos = data.features.map( t=> {

        return {
            titulo: t.properties.title,
            fecha: new Date(t.properties.time),
            ubicacion: t.properties.place,
            codigo: t.properties.code,
            magnitud: t.properties.mag,
            tipoMedida: t.properties.magType,
            longitud: t.geometry.coordinates[0],
            latitud: t.geometry.coordinates[1]
        }
    });
    console.log(terremotos); 
    return terremotos;
}

async function initMap() {
  //situar el mapa
  var map = L.map("mapa").setView([20, 0], 2);

  //carga las images del mapa
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const terremotos = await getEarthquakes();

  terremotos.forEach((t) => {
    L.circleMarker([t.latitud, t.longitud], {
      color: getColor(t.magnitud),
      fillColor: getColor(t.magnitud),
      fillOpacity: 0.5,
      radius: 5,
    })
      .bindPopup(
        `
            <h2>${t.titulo}</h2><br>
            Fecha: ${t.fecha}<br>
            Ubicación: ${t.ubicacion}<br>
            Código: ${t.codigo}<br>
            Magnitud: ${t.magnitud}<br>
            `,
      )
      .addTo(map);
  });
}
initMap();

function getColor(magnitud){
    if(magnitud >= 6) return "red";
    else if(magnitud >= 5) return "orange";
    else if(magnitud >= 3) return "yellow";
    else if(magnitud >= 1) return "green";
    else return "white";
}
