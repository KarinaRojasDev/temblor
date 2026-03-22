
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

