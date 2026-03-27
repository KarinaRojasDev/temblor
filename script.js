// CONFIGURACIÓN DE FIREBASE
let firebaseConfig = {
  apiKey: "AIzaSyAublgEooD1AsPPpurfrf61UhRJkjpOkvw",
  authDomain: "temblor-db.firebaseapp.com",
  projectId: "temblor-db",
  storageBucket: "temblor-db.firebasestorage.app",
  messagingSenderId: "188068678690",
  appId: "1:188068678690:web:4ef24bffba97ba44b98e7b",
};

// Iniciamos la conexión con Firebase
firebase.initializeApp(firebaseConfig);

// Creamos una referencia a la base de datos Firestore
// que usaremos para leer y escribir datos
const db = firebase.firestore();

let map;
let map2;
let marcadores = [];
let marcadores2 = [];

// OBTENER TERREMOTOS DESDE EL ARCHIVO LOCAL
async function getEarthquakes() {
  // Hacemos una petición al archivo JSON local
  let res = await fetch(`./assets/data/terremotos.json`);
  let data = await res.json();

  // Transformamos cada terremoto del formato GeoJSON, con nuestro datos
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
      url: t.properties.url,
    };
  });
  console.log(terremotos);
  return terremotos;
}

// INICIALIZAMOS EL MAPA PRINCIPAL
async function initMap() {
  // Solo creamos el mapa una vez; si ya existe, lo reutilizamos
  if (!map) {
    // Creamos el mapa con latitud, longitud y zoom
    map = L.map("mapa").setView([20, 0], 2);

    // Añadimos las imágenes del mapa
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
  }

  // Borramos los marcadores anteriores para no duplicarlos
  limpiarMarcadores();
  // Obtenemos los terremotos del JSON local
  const terremotos = await getEarthquakes();

  // Por cada terremoto, creamos una tarjeta informativa y un marcador en el mapa
  terremotos.forEach((t) => {
    // Creamos article: el contenedor principal de la tarjeta
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

    let url = document.createElement("a");
    url.href = t.url;
    url.textContent = "Ver más detalles";
    url.target = "_blank";
    article.appendChild(url);

    // Solo mostramos el botón de favoritos si hay un usuario logado
    //currentUser: Obtener información del usuario actual
    const user = firebase.auth().currentUser;
    if (user) {
      let addFavoritos = document.createElement("button");
      addFavoritos.textContent = "Añadir a favoritos";
      addFavoritos.className = "btn-add-favoritos";

      addFavoritos.addEventListener("click", () => {
        guardarFavorito(t);
      });
      //user con login, ve la tarjeta completa con el botón de añadir a favoritos
      article.appendChild(addFavoritos);
    }

    // Creamos el marcador circular en el mapa con color según la magnitud
    let marcador = L.circleMarker([t.latitud, t.longitud], {
      color: getColor(t.magnitud),
      fillColor: getColor(t.magnitud),
      fillOpacity: 0.5,
      radius: 5,
    })
      // Al hacer clic en el marcador, muestra la tarjeta
      .bindPopup(article)
      // Añade el marcador al mapa
      .addTo(map);
    // Guardamos el marcador en el array para poder borrarlo después
    marcadores.push(marcador);
  });
}
initMap();

/* limpia mapa */
// Elimina todos los marcadores del mapa y vacía el array
function limpiarMarcadores() {
  marcadores.forEach((m) => m.remove());
  marcadores = [];
}

//GUARDAR UN TERREMOTO EN FAVORITOS (Firestore)
function guardarFavorito(t) {
  // Obtenemos el usuario actualmente logado
  const user = firebase.auth().currentUser;

  // Referencia al doc. del usuario en la colección "user" de Firestore
  const userRef = db.collection("user").doc(user.uid);

  userRef.get().then((doc) => {
    //existe en la bbdd
      if (doc.exists) {
        //extrae todos los datos de favoritos
        const favoritos = doc.data().favoritos;
        // Comprobamos si el terremoto ya está en favoritos
        const duplicado = favoritos.find((f) => f.codigo === t.codigo);
        if (duplicado) {
          alert("Este terremoto ya está en favoritos");
          return;
        }
        // crea un array nuevo con (todos los elementos) que ya había en favoritos, y añade el objeto (t) al final
        const updateFavoritos = [...favoritos, t];

        // Actualizamos el documento en Firestore con el nuevo array
        userRef.update({ favoritos: updateFavoritos }).then(() => {
          alert("Foto añadida a favoritos.");
        });
      } else {
        console.log("No se encontró el usuario.");
      }
    })
    .catch((error) => {
      console.error("Error añadiendo a favoritos: ", error);
    });
}
/* colores de la magnitud */
function getColor(magnitud) {
  if (magnitud > 7) return "#ea3da2";
  else if (magnitud >= 6) return "#d2120b";
  else if (magnitud >= 5) return "#ef9608";
  else if (magnitud >= 4) return "#F2C300";
  else if (magnitud >= 3) return "#F2E500";
  else if (magnitud >= 2) return "#8A8F1A";
  else if (magnitud >= 1) return "#1F8E1F";
  else return "#CFCFCF";
}

// LEER Y MOSTRAR LOS FAVORITOS DEL USUARIO
// Obtiene el array de favoritos de Firestore y los pinta en el mapa
function leerFavoritos() {
  const user = firebase.auth().currentUser;
  const userRef = db.collection("user").doc(user.uid);

  userRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        let favoritos = doc.data().favoritos;

        // Si no tiene favoritos aún, usamos un array vacío para no dar error
        if (!favoritos) {
          favoritos = [];
        }
        limpiarMarcadores();
        favoritos.forEach((t) => {
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
          tipoMedida.textContent = `Tipo de medida: ${t.tipoMedida}`;
          article.appendChild(tipoMedida);

          let url = document.createElement("a");
          url.href = t.url;
          url.textContent = "Ver más detalles";
          url.target = "_blank";
          article.appendChild(url);

          // Botón para eliminar este favorito de la base de datos
          let btnEliminar = document.createElement("button");
          btnEliminar.textContent = "Eliminar de favoritos";
          btnEliminar.className = "btn-eliminar-favorito";
          btnEliminar.addEventListener("click", () => {
            // Pasa el código único del terremoto
            eliminarFavorito(t.codigo);
          });
          article.appendChild(btnEliminar);

          // Marcador en el mapa con color según magnitud
          let marcador = L.circleMarker([t.latitud, t.longitud], {
            color: getColor(t.magnitud),
            fillColor: getColor(t.magnitud),
            fillOpacity: 0.5,
            radius: 5,
          })
            .bindPopup(article)
            .addTo(map);
          // Guardamos el marcador para poder limpiarlo
          marcadores.push(marcador);
        });
      }
    })
    .catch((error) => {
      console.error("Error leyendo favoritos: ", error);
    });
}

/* Elimina un favorito  */
function eliminarFavorito(codigo) {
  const user = firebase.auth().currentUser;
  const userRef = db.collection("user").doc(user.uid);

  userRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        let favoritos = doc.data().favoritos;

        // Filtramos el array quedándonos con todos los favoritos EXCEPTO el que tenga el código a eliminar
        const nuevosFavoritos = favoritos.filter((f) => f.codigo !== codigo);
        userRef.update({ favoritos: nuevosFavoritos }).then(() => {
          alert("Terremoto eliminado de favoritos");
          leerFavoritos();
        });
      }
    })
    .catch((error) => {
      console.error("Error eliminando favorito: ", error);
    });
}

/* mapa dos */
// MAPA SECUNDARIO CON FILTROS
async function fetchEarthquakesFiltrados(magnitud, fechaInicio, fechaFin) {
  let res = await fetch(
    `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=${magnitud}&starttime=${fechaInicio}&endtime=${fechaFin}`,
  );
  let data = await res.json();

  // Transformamos al mismo formato que usamos en el mapa principal
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

// Inicializa el segundo mapa
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

// Recoge los valores del formulario, los valida y lanza la búsqueda
async function buscarTerremotos() {
  let magnitud = document.getElementById("magnitud").value;
  let fechaInicio = document.getElementById("fecha-inicio").value;
  let fechaFin = document.getElementById("fecha-fin").value;

  // Limpiamos mensajes de error anteriores
  let mensaje = document.getElementById("mensaje");
  mensaje.textContent = "";
  let errorMensaje = "";

  // Validamos que la magnitud sea un número entre 0 y 7 (con o sin decimales)
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
    /* limpia marcadores anteriores del mapa 2 */
    marcadores2.forEach((m) => m.remove());
    marcadores2 = [];

    // Pedimos los terremotos filtrados a la API
    let filtros = await fetchEarthquakesFiltrados(
      magnitud,
      fechaInicio,
      fechaFin,
    );

    // Pintamos cada resultado como marcador en el mapa 2
    filtros.forEach((f) => {
      let marcador = L.circleMarker([f.latitud, f.longitud], {
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
      marcadores2.push(marcador);
    });
  }
}

initMap2();

document
  .querySelector(".btn-buscar")
  .addEventListener("click", () => buscarTerremotos());

/* Crea el documento del usuario en Firestore con email y array de favoritos vacío */
const createUser = (user) => {
  db.collection("user")
    .doc(user.id)
    .set({
      email: user.email,
      favoritos: [],
    })
    .then(() => console.log("Usuario creado con ID: ", user.id))
    .catch((error) => console.log("Error creando usuario: ", error));
};

/* Registra un nuevo usuario en Firebase Auth y lo guarda en Firestore */
const singUpUser = (email, password) => {
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      let user = userCredential.user;
      /* mensaje en el dom */
      document.getElementById("mensaje-registro").textContent =
        `Usuario ${user.email} registrado correctamente con ID:${user.uid}`;

      setTimeout(() => {
        document.getElementById("mensaje-registro").textContent = "";
      }, 4000);

      // Limpiamos el formulario
      document.getElementById("form1").reset();

      // Creamos el documento del usuario en Firestore
      createUser({
        id: user.uid,
        email: user.email,
      });
    })
    .catch((error) => {
      document.getElementById("mensaje-registro").textContent = error.message;
    });
};

// Escuchamos el envío del formulario de registro
document.getElementById("form1").addEventListener("submit", (event) => {
  event.preventDefault();
  let email = event.target.email.value;
  let pass = event.target.pass.value;
  let pass2 = event.target.pass2.value;

  pass === pass2 ? singUpUser(email, pass) : alert("error password");
});

// Registra un nuevo usuario en Firebase Authentication
const signInUser = (email, password) => {
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      let user = userCredential.user;

      /* mensaje de bienbenida en el DOM */
      document.getElementById("mensaje-login").textContent =
        `Bienvenido ${user.email} con ID:${user.uid}`;

      setTimeout(() => {
        document.getElementById("mensaje-login").textContent = "";
      }, 4000);

      // Limpiamos el formulario de login
      document.getElementById("form2").reset();
    })
    .catch((error) => {
      document.getElementById("mensaje-login").textContent =
        "Usuario no encontrado, por favor regístrese antes de iniciar sesión";
      console.log(`
    Error en el sistema ${error.message}
    Error: ${error.code}`);
    });
};

// Escuchamos el envío del formulario de login
document.getElementById("form2").addEventListener("submit", (event) => {
  event.preventDefault();
  let email = event.target.email2.value;
  let pass = event.target.pass3.value;
  signInUser(email, pass);
});

/* Cierra la sesión del usuario actual en Firebase Auth */
const signOut = () => {
  let user = firebase.auth().currentUser;

  firebase
    .auth()
    .signOut()
    .then(() => {
      console.log(`Sale del sistema: ${user.email}`);
    })
    .catch((error) => {
      console.log(`Hubo un error: ${error}`);
    });
};

// Asignamos el evento click al botón de cerrar sesión
document.getElementById("salir").addEventListener("click", () => signOut());

// Botón para ver todos los terremotos (vuelve a cargar el mapa principal)
document.querySelector(".btn-favoritos").addEventListener("click", leerFavoritos);

// Botón para ver los favoritos del usuario
document.querySelector(".btn-terremotos").addEventListener("click", initMap);

//Este listener se ejecuta automáticamente cada vez que
// el usuario inicia sesión o cierra sesión 
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // Hay un usuario logado → mostramos su UID y cargamos el mapa
    console.log(`Está en el sistema:${user.email} ${user.uid}`);
    document.getElementById("message").innerText =
      `Está en el sistema: ${user.uid}`;
    initMap();
  } else {
    // No hay usuario logado → mostramos mensaje informativo
    console.log("no hay usuarios en el sistema");
    document.getElementById("message").innerText =
      `No hay usuarios en el sistema`;
  }
});
