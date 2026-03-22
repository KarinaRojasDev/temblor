
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
      .bindPopup(`
        <article>
          <h2>${t.titulo}</h2>
          <p>Fecha: ${t.fecha}</p>
          <p>Ubicación: ${t.ubicacion}</p>
          <p>Código: ${t.codigo}</p>
          <p>Magnitud: ${t.magnitud}</p>
          <p>Tipo de medida:${t.tipoMedida}</p>
        </article>`
      ).addTo(map);
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

/* mapa dos */
let map2;
async function fetchEarthquakesFiltrados(magnitud,fechaInicio,fechaFin){
  let res = await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=${magnitud}&starttime=${fechaInicio}&endtime=${fechaFin}`);
  let data = await res.json();
  let filtroMagnitud = data.features.map(f => {
    return {
      titulo: f.properties.title,
      fecha: new Date(f.properties.time),
      ubicacion: f.properties.place,
      codigo: f.properties.code,
      magnitud: f.properties.mag,
      tipoMedida: f.properties.magType,
      longitud: f.geometry.coordinates[0],
      latitud: f.geometry.coordinates[1],
    };
  })
  return filtroMagnitud;
}

async function initMap2() {
  //situar el mapa
  map2 = L.map("mapa2").setView([20, 0], 2);

  //carga las images del mapa
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map2);
}

async function buscarTerremotos() {
  let magnitud = document.getElementById("magnitud").value;
  let fechaInicio = document.getElementById("fecha-inicio").value;
  let fechaFin = document.getElementById("fecha-fin").value;

  let filtros  = await fetchEarthquakesFiltrados(magnitud,fechaInicio,fechaFin);

  filtros.forEach((f) => {
    L.circleMarker([f.latitud, f.longitud], {
      color: getColor(f.magnitud),
      fillColor: getColor(f.magnitud),
      fillOpacity: 0.5,
      radius: 5,
    })
      .bindPopup(`
        <article>
          <h2>${f.titulo}</h2>
          <p>Fecha: ${f.fecha}</p>
          <p>Ubicación: ${f.ubicacion}</p>
          <p>Código: ${f.codigo}</p>
          <p>Magnitud: ${f.magnitud}</p>
          <p>Tipo de medida:${f.tipoMedida}</p>
        </article>`
      ).addTo(map2);
  });
}
initMap2();
document.getElementById("btn-buscar").addEventListener("click", () => buscarTerremotos());