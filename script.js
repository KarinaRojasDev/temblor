<<<<<<< HEAD
function getEarthquakes(){
    fetch(`https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`)
    .then(res => res.json())
    .then(data =>{
        const terremotos = data.features.map((t) => {
          return `
            Título: ${t.properties.title} 
            Fecha: ${new Date(t.properties.time)} 
            Ubicación: ${t.properties.place}
            Código: ${t.properties.code}
            Magnitud ${t.properties.mag}
            Tipo de Medida: ${t.properties.magType}
            Longitud: ${t.geometry.coordinates[0]}
            Latitud: ${t.geometry.coordinates[1]}
            `;
        });
        console.log(terremotos);
        return terremotos;
    })
}
getEarthquakes();
=======
async function initMap(){
    const terremotos = await getEarthquakes();

    
    //situar el mapa
    var map = L.map("mapa").setView([20,0], 2);

    //carga las images del mapa
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", 
        {
            maxZoom: 19,
            attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }
    ).addTo(map);

    //marcador circular
   

    //añade un Popup al mapa
    

}
>>>>>>> feature/mapa
