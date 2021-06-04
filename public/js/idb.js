//create variable to hold db connection
let db;

//establish connection to IndexDB called budget-tracker and set to V1
const request = indexedDB.open('budget_tracker', 1);

//trigger event listener if version changes
request.onupgradeneeded = function(event) {
     //save ref to db
     const db = event.target.result;

     //create ObjectStore called transactions, set it to auto_increment primary key
     db.createObjectStore('transactions', { autoIncrement: true });
};

request.onsuccess = function(event) {
     db = event.target.result;

     //check if app is online, then run cacheTransaction

     if(navigator.online) {
          cacheTransaction()//TODO: Does anything get passed in here?
     }
};

request.onerror = function(event) {
     console.log(event.target.errorCode);
};

//Save transaction to indexdb if there's no internet connection
function saveRecord(record){
     const transaction = db.transaction(['transactions'], 'readwrite');

     const moneyObjectStore = transaction.objectStore('transactions');

     moneyObjectStore.add(record);
};

function cacheTransaction() {
     //open transaction on database
}