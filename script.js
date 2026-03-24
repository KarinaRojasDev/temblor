let firebaseConfig = {
  apiKey: "AIzaSyAublgEooD1AsPPpurfrf61UhRJkjpOkvw",
  authDomain: "temblor-db.firebaseapp.com",
  projectId: "temblor-db",
  storageBucket: "temblor-db.firebasestorage.app",
  messagingSenderId: "188068678690",
  appId: "1:188068678690:web:4ef24bffba97ba44b98e7b",
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore(); 


async function getEarthquakes() {
  let res = await fetch(
    `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`,
  );
  let data = await res.json();

  const terremotos = data.features.map((t) => {
    return {
      titulo: t.properties.title,
      fecha: new Date(t.properties.time),
      ubicacion: t.properties.place,
      codigo: t.properties.code,
      magnitud: t.properties.mag,
      tipoMedida: t.properties.magType,
      longitud: t.geometry.coordinates[0],
      latitud: t.geometry.coordinates[1],
    };
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
    let article = document.createElement("article");
    article.className = "favoritos";

    let titulo = document.createElement("h2");
    titulo.textContent = t.titulo;
    article.appendChild(titulo);

    let fecha = document.createElement("p");
    fecha.textContent = `Fecha: ${t.fecha}`;
    article.appendChild(fecha);

    let ubicacion = document.createElement("p");
    ubicacion.textContent = `Ubicación: ${t.ubicacion}`;
    article.appendChild(ubicacion);

    let codigo = document.createElement("p");
    codigo.textContent = `Código: ${t.codigo}`;
    article.appendChild(codigo);

    let magnitud = document.createElement("p");
    magnitud.textContent = `Magnitud: ${t.magnitud}`;
    article.appendChild(magnitud);

    let tipoMedida = document.createElement("p");
    tipoMedida.textContent = `Tipo de medida:${t.tipoMedida}`;
    article.appendChild(tipoMedida);

    let addFavoritos = document.createElement("button");
    addFavoritos.textContent = "Añadir a favoritos";
    addFavoritos.className = "btn-add-favoritos";
    addFavoritos.addEventListener("click", () => {
      guardarFavorito(t);
    });
    article.appendChild(addFavoritos);

    L.circleMarker([t.latitud, t.longitud], {
      color: getColor(t.magnitud),
      fillColor: getColor(t.magnitud),
      fillOpacity: 0.5,
      radius: 5,
    })
      .bindPopup(article)
      .addTo(map);
  });
}
initMap();

function guardarFavorito() {}

function getColor(magnitud) {
  if (magnitud >= 6) return "red";
  else if (magnitud >= 5) return "orange";
  else if (magnitud >= 3) return "yellow";
  else if (magnitud >= 1) return "green";
  else return "white";
}

/* mapa dos */
let map2;
async function fetchEarthquakesFiltrados(magnitud, fechaInicio, fechaFin) {
  let res = await fetch(
    `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=${magnitud}&starttime=${fechaInicio}&endtime=${fechaFin}`,
  );
  let data = await res.json();
  let filtroMagnitud = data.features.map((f) => {
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
  });
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

  /* validación magnitud */

  let mensaje = document.getElementById("mensaje");
  mensaje.textContent = "";
  let errorMensaje = "";
  const regexMagnitud = /^[0-7](\.\d+)?$/;

  if (!regexMagnitud.test(magnitud)) {
    errorMensaje += "- La magnitud debe estar entre 0 y 7\n";
  }

  /* validación año inicio, año fin */
  const fechaActual = new Date();
  const fechaInicioDate = new Date(fechaInicio);
  const fechaFinDate = new Date(fechaFin);

  if (fechaInicioDate > fechaActual)
    errorMensaje +=
      "- La fecha inicio no puede ser mayor que la fecha actual.\n";
  if (fechaInicioDate > fechaFinDate)
    errorMensaje += "- La fecha inicio no puede ser mayor que la fecha fin.\n";
  if (fechaFinDate > fechaActual)
    errorMensaje += "- La fecha fin no puede ser mayor que la fecha actual.\n";

  if (errorMensaje) {
    mensaje.textContent = errorMensaje;
  } else {
    let filtros = await fetchEarthquakesFiltrados(
      magnitud,
      fechaInicio,
      fechaFin,
    );

    filtros.forEach((f) => {
      L.circleMarker([f.latitud, f.longitud], {
        color: getColor(f.magnitud),
        fillColor: getColor(f.magnitud),
        fillOpacity: 0.5,
        radius: 5,
      })
        .bindPopup(
          `
        <article>
          <h2>${f.titulo}</h2>
          <p>Fecha: ${f.fecha}</p>
          <p>Ubicación: ${f.ubicacion}</p>
          <p>Código: ${f.codigo}</p>
          <p>Magnitud: ${f.magnitud}</p>
          <p>Tipo de medida:${f.tipoMedida}</p>
        </article>`,
        )
        .addTo(map2);
    });
  }
}
initMap2();
document
  .querySelector(".btn-buscar")
  .addEventListener("click", () => buscarTerremotos());
