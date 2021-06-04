//create variable to hold db connection
let db;

//establish connection to IndexDB called budget-tracker and set to V1
const request = indexedDB.open("budget", 1);

//trigger event listener if version changes
request.onupgradeneeded = function (event) {
  //save ref to db
  db = event.target.result;

  //create ObjectStore called transactions, set it to auto_increment primary key
  db.createObjectStore("moneyLog", { autoIncrement: true });
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
  let transaction = db.transaction(["moneyLog"], "readwrite");

  let moneyObjectStore = transaction.objectStore("moneyLog");

  //add data from form to object store
  moneyObjectStore.add(savedTransaction);
}

function uploadTransaction() {
  //open transaction on database
  let transaction = db.transaction(["moneyLog"], "readwrite");

  //access object store
  let moneyObjectStore = transaction.objectStore("moneyLog");

  //get all records and set to variable
  let getAll = moneyObjectStore.getAll();

  //upon successful getAll, run the following:
  //TODO: CHANGE getAll.result[0] to a string that encapsulates all offline entries -> for loop?
  getAll.onsuccess = function () {
    //if data is in the object store, send to api
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
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
          let transaction = db.transaction(["moneyLog"], "readwrite");

          //access object store
          let moneyObjectStore = transaction.objectStore("moneyLog");

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
