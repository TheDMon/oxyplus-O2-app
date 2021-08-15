importScripts("./ngsw-worker.js");

 var apiBaseUrl = 'https://oxyplus-api.mybluemix.net';

//  (function Init(){
//    if (window.location.href.includes('localhost')) {
//      apiBaseUrl = 'http://localhost:3000';
//    } else {
//      apiBaseUrl = 'https://oxyplus-api.mybluemix.net';
//    }
//  })();

self.addEventListener("sync", function (event) {
  if (event.tag === 'add-request') {
    event.waitUntil(syncRequest());
  }
});

function syncRequest(){
  const request = indexedDB.open('oxyplus-db');
  request.onerror = (event) => {
    console.log('Could not open indexedDB from custom service worker', event);
  };
  request.onsuccess = (event) => {
    const db = event.target.result;
    getRequest(db);
  };
}

function getRequest(db) {
  const transaction = db.transaction(['request-store']);
  const objectStore = transaction.objectStore('request-store');
  const request = objectStore.get('request');
  request.onerror = (event) => {
    // Handle errors!
  };
  request.onsuccess = (event) => {
    // Do something with the request.result!
    sendRequest(request.result);
    console.log('request object ====> ', request.result);
  };
}

function sendRequest(request) {
  fetch(`${apiBaseUrl}/request/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })
    .then(() => Promise.resolve())
    .catch(() => Promise.reject());
}

function deleteLocalCopy(){

}
