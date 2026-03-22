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
getEarthquakes();