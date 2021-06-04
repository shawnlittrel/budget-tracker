//create variable to hold db connection
let db;

//establish connection to IndexDB called budget-tracker and set to V1
const request = indexedDB.open("budget_tracker", 1);

//trigger event listener if version changes
request.onupgradeneeded = function (event) {
  //save ref to db
  const db = event.target.result;

  //create ObjectStore called transactions, set it to auto_increment primary key
  db.createObjectStore("transactions", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  //check if app is online, then run uploadTransaction

  if (navigator.online) {
    uploadTransaction();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

//Save transaction to indexdb if there's no internet connection
function saveRecord(savedTransaction) {
  const transaction = db.transaction(["transactions"], "readwrite");

  const moneyObjectStore = transaction.objectStore("transactions");

  moneyObjectStore.add(savedTransaction);
}

function uploadTransaction() {
  //open transaction on database
  const transaction = db.transaction(["transactions"], "readwrite");

  //access object store
  const moneyObjectStore = transaction.objectStore("transactions");

  //get all records and set to variable
  const getAll = moneyObjectStore.getAll();

  //upon successful getAll, run the following:
  getAll.onsuccess = function () {
    //if data is in the object store, send to api
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(transaction),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          //open another transaction
          const transaction = db.transaction(["transactions"], "readwrite");

          //access object store
          const moneyObjectStore = transaction.objectStore("transactions");

          //clear all items in object store
          moneyObjectStore.clear();

          alert("All saved transactions have been submitted to the server");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

//listen for app to come online
window.addEventListener("online", uploadTransaction);
