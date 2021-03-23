let db;
const request = window.indexedDB.open('Budget', 2)


request.onupgradeneeded = e => {
  const db = e.target.result;
  db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true });
};

request.onsuccess = e => {
  db = e.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = e => {
  console.log("Successfully opened! " + e.target.errorCode);
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