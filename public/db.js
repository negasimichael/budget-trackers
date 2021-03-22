let db;
const request = indexedDB.open('budget', 2);

request.onupgradeneeded = function (evt) {
  const db = evt.target.result;
  db.createObjectStore('pending', {keyPath: 'id', autoIncrement: true });
};

request.onsuccess = function (evt) {
  db = evt.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (evt) {
  console.log("Hello World! " + evt.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(['pending'], 'readwrite');
  const store = transaction.objectStore('pending');

  store.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(['pending'], 'readwrite');
  const store = transaction.objectStore('pending');
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(() => {
          const transaction = db.transaction(['pending'], 'readwrite');
          const store = transaction.objectStore('pending');
          store.clear();
        });
    }
  };
}
function deletePending() {
  const transaction = db.transaction(['pending'], 'readwrite');
  const store = transaction.objectStore('pending');
  store.clear();
}
// listening app coming back online
window.addEventListener("online", checkDatabase);