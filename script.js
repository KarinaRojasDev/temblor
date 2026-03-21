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