let historyData = JSON.parse(localStorage.getItem("object"));
let tableContentData = document.getElementById("tableContent");
function updateHistory(){
    historyData.forEach(entry=> {
        let row = document.createElement("tr");        
        row.innerHTML=`
         <td>${entry.id}</td>
         <td>${entry.location}</td>
         <td>${entry.temperature}</td>
         <td style="display:flex;justify-content:center;align-items:center;"><img src=${entry.images} />${entry.condition}</td>
         <td>${entry.feelsLike}</td>
         <td>${entry.date}</td>
        `
        tableContentData.appendChild(row);
    });
}

window.onload = updateHistory;

