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