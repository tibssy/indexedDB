let db = null;

function createDB() {
    const request = indexedDB.open("currencies", "1");

    request.onupgradeneeded = e => {
        db = e.target.result;
        const store = db.createObjectStore("data", { keyPath: 'currency' });
    }

    request.onsuccess = e => {
        db = e.target.result;
        downloadData();

    }

    request.onerror = e => {
        alert("error");
    }
}

function downloadData() {
    const Http = new XMLHttpRequest();
    const url = 'https://api.exchangeratesapi.io/latest';

    Http.open("GET", url);
    Http.send();

    Http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let rates = JSON.parse(Http.responseText);
            addData(rates);
        }
        readData("HUF");
    }
}


function addData(dataJson) {

    Object.entries(dataJson.rates).forEach(entry => {
        const [key, value] = entry;
        let data = {
            currency: key,
            rate: value
        };
        const tx = db.transaction("data", "readwrite");
        tx.onerror = e => console.log("error " + e.target.error);
        const store = tx.objectStore("data");
        store.put(data);
    });
}

function readData(val1) {
    const tx = db.transaction("data", "readonly");
    const store = tx.objectStore("data");


    let data = store.get(val1);
    console.log(data);


    const request = store.openCursor();
    request.onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) {
            console.log("Currency: " + cursor.key + "  rate: " + cursor.value.rate);

            cursor.continue();
        }
    }
}

createDB();
