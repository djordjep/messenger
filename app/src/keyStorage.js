// Open a database
function openDb(name, version, upgradeCallback) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => upgradeCallback(event.target.result);
  });
}

export async function storeKey(key) {
  const db = await openDb("KeyDatabase", 1, (db) => {
    if (!db.objectStoreNames.contains("keys")) {
      db.createObjectStore("keys");
    }
  });

  // Ensuring that the database upgrade is complete before proceeding
  db.onversionchange = (event) => {
    db.close();
    alert("Database is outdated, please reload the page.");
  };

  // Exporting the key here, transaction only lasts one event loop
  // so no awaiting should be done between transaction and store.put
  const jwkKey = await window.crypto.subtle.exportKey("jwk", key);

  const tx = db.transaction("keys", "readwrite");
  const store = tx.objectStore("keys");
  await store.put(jwkKey, "privateKey");
  await tx.complete;
  db.close();
}

function getKeyFromStore(store) {
  return new Promise((resolve, reject) => {
    //'store' is a reference to an IndexedDB object store
    let request = store.get("privateKey");

    request.onsuccess = function (event) {
      resolve(event.target.result);
    };

    request.onerror = function (event) {
      reject("Error in getKeyFromStorage: " + event.target.errorCode);
    };
  });
}

export async function getKey() {
  const db = await openDb("KeyDatabase", 1, (db) => {
    if (!db.objectStoreNames.contains("keys")) {
      db.createObjectStore("keys");
    }
  });
  const tx = db.transaction("keys", "readonly");
  const store = tx.objectStore("keys");
  const jwkKey = await getKeyFromStore(store);
  db.close();

  console.log("jwkKey");
  console.log(jwkKey);

  if (!jwkKey) {
    return null;
  }

  return jwkKey;
}
