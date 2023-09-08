const map = new ol.Map({
  target: "map",
  layers: [
      new ol.layer.Tile({
          source: new ol.source.OSM(),
      }),
  ],
  view: new ol.View({
      center: ol.proj.fromLonLat([35.3191, 39.0099]),
      zoom: 7,
  }),
});
const pointStyle = new ol.style.Style({
  image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({
          color: "red",
      }),
  }),
});

const drawLayer = new ol.layer.Vector({
  source: new ol.source.Vector(),
  style: pointStyle,
});

map.addLayer(drawLayer);

const draw = new ol.interaction.Draw({
  source: drawLayer.getSource(),
  type: "Point",
});

draw.on("drawend", event => {
  const coordinates = event.feature.getGeometry().getCoordinates();

  const content = `
      <div style="text-align: center;">
          <br>
          <label for="pointName">Point Adı:</label>
          <input type="text" id="pointName" value="Point"><br><br>
          <label for="xCoordinate">X Koordinatı:</label>
          <input type="text" id="xCoordinate" value="${coordinates[0]}" readonly><br><br>
          <label for="yCoordinate">Y Koordinatı:</label>
          <input type="text" id="yCoordinate" value="${coordinates[1]}" readonly><br><br>
          <button class="saveButton">Kaydet</button>
      </div>
  `;

  openPanel(content);
});

function openPanel(content) {
  const panel = jsPanel.create({
      content: content,
      headerTitle: "Nokta Bilgileri",
      theme: "primary",
      closeOnEscape: true,
  });

  panel.querySelector(".saveButton").addEventListener("click", () => {
      const pointName = panel.querySelector("#pointName").value;
      const xCoordinate = panel.querySelector("#xCoordinate").value;
      const yCoordinate = panel.querySelector("#yCoordinate").value;

      const data = {
          name: pointName,
          x: parseInt(xCoordinate),
          y: parseInt(yCoordinate),
      };

      const apiUrl = "/api/Door/Add";

      fetch(apiUrl, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
      })
      .then(response => response.json())
      .then(responseData => {
          console.log("Başarılı:", responseData);
          panel.close();
          
      })
      .catch(error => {
          console.error("Hata:", error);
         
      });
  });
}

document.getElementById("btn1").addEventListener("click", () => {
  map.addInteraction(draw);
});
