import { getKey } from "./keyStorage";

function base64UrlToArrayBuffer(base64url) {
  // Replace base64url character encoding with standard base64 encoding
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");

  // Pad base64 string to make its length a multiple of 4
  while (base64.length % 4) {
    base64 += "=";
  }

  // Decode base64 string to a binary string
  const binaryString = window.atob(base64);

  // Convert binary string to ArrayBuffer
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}

function binaryStringToArrayBuffer(binary) {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

async function decryptSymmetricKey(encryptedSymmetricKeyBase64, privateKey) {
  const encryptedSymmetricKey = base64ToArrayBuffer(
    encryptedSymmetricKeyBase64
  );

  const decryptedKey = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    encryptedSymmetricKey
  );

  return decryptedKey; // ArrayBuffer of the decrypted symmetric key
}

const decryptMessage = async (message, user) => {
  return message;
  // Decrypt the symmetric key using RSA-OAEP

  // get the private key from IndexedDB
  const privateKey = await getKey();

  console.log(privateKey);

  //  find the encrypted symmetric key for this user
  console.log(message);
  const SymmetricKey = message.keys.find((key) => key.userId === user.userId);

  const encryptedSymmetricKey = SymmetricKey.encryptedKey;
  const iv = base64ToArrayBuffer(SymmetricKey.iv);

  console.log(encryptedSymmetricKey);
  console.log(iv);

  if (!encryptedSymmetricKey || !privateKey) {
    return message;
  }

  let decryptedSymmetricKey = null;
  let decryptedMessage = null;

  try {
    decryptedSymmetricKey = await decryptSymmetricKey(
      encryptedSymmetricKey,
      privateKey
    );
  } catch (e) {
    console.log(`Error decrypting symmetric key: ${e}`);
  }

  const importedSymmetricKey = await window.crypto.subtle.importKey(
    "raw",
    decryptedSymmetricKey,
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );

  console.log(decryptedSymmetricKey);
  console.log(iv);
  console.log(message.content);

  // Decrypt the message using AES-CBC
  try {
    decryptedMessage = await window.crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: iv,
      },
      importedSymmetricKey,
      base64ToArrayBuffer(message.content)
    );
  } catch (e) {
    console.log(`Error decrypting message: ${e}`);
  }

  message.content = new TextDecoder().decode(decryptedMessage);

  return message;
};

export const decryptMessages = async (messages, user) => {
  const promises = messages.map(async (message) => {
    const decryptedMessage = await decryptMessage(message, user);
    return decryptedMessage;
  });
  return await Promise.all(promises);
};
