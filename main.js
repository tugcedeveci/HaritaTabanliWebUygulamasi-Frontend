// Harita oluşturma
const map = new ol.Map({
  target: "map",
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([35.3191, 39.0099]),
    zoom: 6,
  }),
});

// Nokta stilini tanımlama
const pointStyle = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 6,
    fill: new ol.style.Fill({
      color: "red",
    }),
  }),
});

// Çizim katmanını oluşturma
const drawLayer = new ol.layer.Vector({
  source: new ol.source.Vector(),
  style: pointStyle,
});

map.addLayer(drawLayer);

// Çizim işlemi için etkileşim
const draw = new ol.interaction.Draw({
  source: drawLayer.getSource(),
  type: "Point",
});

// Düzenleme için etkileşim
const modify = new ol.interaction.Modify({
  source: drawLayer.getSource(),
});

// Snap için etkileşim
const snap = new ol.interaction.Snap({
  source: drawLayer.getSource(),
});

map.addInteraction(draw);
map.addInteraction(modify);
map.addInteraction(snap);

document.addEventListener("DOMContentLoaded", () => {
  showDataTableAndAddPointsToMap();
});

//AddPoint tıkladığında
draw.on("drawend", event => {
  const coordinates = event.feature.getGeometry().getCoordinates();
  //Ad point Panel
  const content = `
    <div style="text-align: center;">
        <br>
        <label for="pointName">Name:</label>
        <input type="text" id="pointName" value="Point"><br><br>
        <label for="xCoordinate">X Koordinatı:</label>
        <input type="text" id="xCoordinate" value="${coordinates[0]}" readonly><br><br>
        <label for="yCoordinate">Y Koordinatı:</label>
        <input type="text" id="yCoordinate" value="${coordinates[1]}" readonly><br><br>
        <button class="saveButton">Kaydet</button>
    </div>
  `;

  const panel = openPanel(content);

  panel.querySelector(".saveButton").addEventListener("click", () => {
    const pointName = panel.querySelector("#pointName").value;
    const xCoordinate = panel.querySelector("#xCoordinate").value;
    const yCoordinate = panel.querySelector("#yCoordinate").value;

    const data = {
      name: pointName,
      x: parseFloat(xCoordinate),
      y: parseFloat(yCoordinate),
    };
    //ADD
    const apiUrl = "https://localhost:44360/api/door/add";

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        if (response.ok) {
          Toastify({
            text: "Kayıt başarıyla eklendi.",
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top",
            position: "right",
            style: {
              background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
          }).showToast();
          panel.close();
        } else {
          Toastify({
            text: "Kayıt eklenirken bir hata oluştu.",
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top",
            position: "right",
            style: {
              background: "linear-gradient(to right, #ff0000, #ff5733)",
            },
          }).showToast();
        }
      })
      .catch(error => {
        console.error("Hata:", error);
      });
  });
});

function openPanel(content) {
  return jsPanel.create({
    content: content,
    headerTitle: "Nokta Bilgileri",
    theme: "dark",
    closeOnEscape: true,
    borderRadius: ".5rem",
  });
}

document.getElementById("btn1").addEventListener("click", () => {
  map.addInteraction(draw);
});

//GETALL
function showDataTable() {
  // API'den verileri al
  fetch("https://localhost:44360/api/door/getall")
    .then(response => response.json())
    .then(data => {
      const tableData = data;

      const table = document.createElement("table");
      table.id = "pointTable";
      table.classList.add("display");
      table.classList.add("stripe");

      const thead = document.createElement("thead");
      const tbody = document.createElement("tbody");

      const headerRow = document.createElement("tr");
      const header1 = document.createElement("th");
      header1.textContent = "Name";
      const header2 = document.createElement("th");
      header2.textContent = "x koordinatı";
      const header3 = document.createElement("th");
      header3.textContent = "y koordinatı";
      const header4 = document.createElement("th");
      header4.textContent = "İşlemler";
      headerRow.appendChild(header1);
      headerRow.appendChild(header2);
      headerRow.appendChild(header3);
      headerRow.appendChild(header4);
      thead.appendChild(headerRow);

      tableData.forEach(data => {
        const row = document.createElement("tr");
        const cell1 = document.createElement("td");
        cell1.textContent = data.name;
        const cell2 = document.createElement("td");
        cell2.textContent = data.x;
        const cell3 = document.createElement("td");
        cell3.textContent = data.y;

        const cell4 = document.createElement("td");
        const updateButton = document.createElement("button");
        updateButton.className = "update-button";
        const icon = document.createElement("i");
        icon.className = "fas fa-edit";
        updateButton.appendChild(icon);

        updateButton.addEventListener("click", () => {
          //Güncelle Panel
          const updateContent = `
         <div style="text-align: center;">
            <br>
            <label for="updateName">Name:</label>
            <input type="text" id="updateName" value="${data.name}"><br><br>
            <label for="updateXCoordinate">X Koordinatı:</label>
            <input type="text" id="updateXCoordinate" value="${data.x}" readonly><br><br>
            <label for="updateYCoordinate">Y Koordinatı:</label>
            <input type="text" id="updateYCoordinate" value="${data.y}" readonly><br><br>
            <button class="updateSaveButton">Güncelle</button>
           
         </div>
          `;

          const updatePanelConfig = {
            header: true,
            content: updateContent,
            closeOnEscape: true,
            borderRadius: ".5rem",
            headerTitle: "Güncelleme",
            theme: "dark",
          };

          const updatePanel = jsPanel.create(updatePanelConfig);

          updatePanel
            .querySelector(".updateSaveButton")
            .addEventListener("click", () => {
              const updatedName =
                updatePanel.querySelector("#updateName").value;
              const updatedXCoordinate =
                updatePanel.querySelector("#updateXCoordinate").value;
              const updatedYCoordinate =
                updatePanel.querySelector("#updateYCoordinate").value;
              const doorId = data.id;

              const updatedData = {
                id: doorId,
                name: updatedName,
                x: parseFloat(updatedXCoordinate),
                y: parseFloat(updatedYCoordinate),
              };
              updatePanel.close();

              //UPDATE
              const apiUrl = `https://localhost:44360/api/door/update`;

              fetch(apiUrl, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
              })
                .then(response => {
                  if (response.ok) {
                    Toastify({
                      text: "Kayıt başarıyla güncellendi.",
                      duration: 3000,
                      newWindow: true,
                      close: true,
                      gravity: "top",
                      position: "right",
                      style: {
                        background:
                          "linear-gradient(to right, #00b09b, #96c93d)",
                      },
                    }).showToast();
                    updatePanel.close();
                  } else {
                    Toastify({
                      text: "Kayıt güncellenirken bir hata oluştu.",
                      duration: 3000,
                      newWindow: true,
                      close: true,
                      gravity: "top",
                      position: "right",
                      style: {
                        background:
                          "linear-gradient(to right, #ff0000, #ff5733)",
                      },
                    }).showToast();
                  }
                })
                .catch(error => {
                  console.error("Hata:", error);
                });
            });
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        const deleteIcon = document.createElement("i");
        deleteIcon.className = "fas fa-trash";
        deleteButton.appendChild(deleteIcon);
        deleteButton.addEventListener("click", () => {
          showDeleteConfirmationPanel(data.name, data.id);
        });

        cell4.appendChild(updateButton);
        cell4.appendChild(deleteButton);

        row.appendChild(cell1);
        row.appendChild(cell2);
        row.appendChild(cell3);
        row.appendChild(cell4);
        tbody.appendChild(row);
      });

      table.appendChild(thead);
      table.appendChild(tbody);

      const panel = openPanelQuery(table);
      const dataTable = $(table).DataTable();
    })
    .catch(error => {
      console.error(error);
      alert("Veriler getirilirken bir hata oluştu.");
    });
}
//Data Table panel
function openPanelQuery(content) {
  jsPanel.create({
    content: content,
    headerTitle: "Data Table",
    theme: "dark",
    closeOnEscape: true,
    borderRadius: ".5rem",
    panelSize: "750 550",
  });
}

document
  .querySelector("#menu button:nth-child(2)")
  .addEventListener("click", () => {
    showDataTable();
  });
//DeletePanelde olanlar
function showDeleteConfirmationPanel(name, id) {
  const confirmationContent = `
      <div style="text-align: center;">
        <br>
        <p class="delete-p">Silmek istediğinize emin misiniz?</p>
        <button id="confirmDeleteButton" class="btn btn-danger">Sil</button>
        <button id="cancelDeleteButton" class="btn btn-secondary">İptal</button>
      </div>
    `;

  const deletePanelConfig = {
    header: true,
    content: confirmationContent,
    closeOnEscape: true,
    borderRadius: ".5rem",
    headerTitle: "Silme",
    theme: "dark",
  };

  const deletePanel = jsPanel.create(deletePanelConfig);

  document
    .getElementById("confirmDeleteButton")
    .addEventListener("click", () => {
      deleteDoor(id);
      deletePanel.close();
    });

  document
    .getElementById("cancelDeleteButton")
    .addEventListener("click", () => {
      deletePanel.close();
    });
}

function deleteDoor(id) {
  const apiUrl = `https://localhost:44360/api/door/delete?id=${id}`;

  fetch(apiUrl, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(response => {
      if (response.ok) {
        Toastify({
          text: "Kayıt başarıyla silindi.",
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top",
          position: "right",
          style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
          },
        }).showToast();
      } else {
        Toastify({
          text: "Kayıt silinirken bir hata oluştu.",
          duration: 3000,
          newWindow: true,
          close: true,
          gravity: "top",
          position: "right",
          style: {
            background: "linear-gradient(to right, #ff0000, #ff5733)",
          },
        }).showToast();
      }
    })
    .catch(error => {
      console.error("Hata:", error);
    });
}
//?????????
function showDataTableAndAddPointsToMap() {
  fetch("https://localhost:44360/api/door/getall")
    .then(response => response.json())
    .then(data => {
      const tableData = data;

      // Verileri haritaya ekleyin
      tableData.forEach(data => {
        const coordinates = [data.x, data.y];

        const pointFeature = new ol.Feature({
          geometry: new ol.geom.Point(coordinates),
        });

        pointFeature.setStyle(pointStyle);
        drawLayer.getSource().addFeature(pointFeature);
      });
      map.getView().setCenter(ol.proj.fromLonLat([35.3191, 39.0099]));
      map.getView().setZoom(6);
    })
    .catch(error => {
      console.error(error);
      alert("Veriler getirilirken bir hata oluştu.");
    });
}

//Her açıldığında bu fonksiyonu çağır
document.addEventListener("DOMContentLoaded", () => {
  showDataTableAndAddPointsToMap();
});

modify.on("modifyend", event => {
  console.log("Modify işlemi tamamlandı.");
  const feature = event.features.getArray()[0];
  const coordinates = feature.getGeometry().getCoordinates();
  const doorId = feature.getId(); // Bu ID'yi feature'dan alın

  const content = `
    <div style="text-align: center;">
      <br>
      <label for="updateXCoordinate">X Koordinatı:</label>
      <input type="text" id="updateXCoordinate" value="${coordinates[0]}" readonly><br><br>
      <label for="updateYCoordinate">Y Koordinatı:</label>
      <input type="text" id="updateYCoordinate" value="${coordinates[1]}" readonly><br><br>
      <button class="updateLocationButton">Konum Güncelle</button>
    </div>
  `;

  const panel = openPanel(content);
  panel.setHeaderTitle("Konum Güncelleme");

  panel.querySelector(".updateLocationButton").addEventListener("click", () => {
    const updatedXCoordinate = panel.querySelector("#updateXCoordinate").value;
    const updatedYCoordinate = panel.querySelector("#updateYCoordinate").value;

    const updatedData = {
      id: doorId,
      x: parseFloat(updatedXCoordinate),
      y: parseFloat(updatedYCoordinate),
    };

    const apiUrl = `https://localhost:44360/api/door/update`;

    fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    })
      .then(response => {
        if (response.ok) {
          Toastify({
            text: "Konum başarıyla güncellendi.",
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top",
            position: "right",
            style: {
              background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
          }).showToast();
          panel.close();
        } else {
          Toastify({
            text: "Konum güncellenirken bir hata oluştu.",
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top",
            position: "right",
            style: {
              background: "linear-gradient(to right, #ff0000, #ff5733)",
            },
          }).showToast();
        }
      })
      .catch(error => {
        console.error("Hata:", error);
      });
  });
});
