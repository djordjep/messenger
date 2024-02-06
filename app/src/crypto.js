import { getKey } from "./keyStorage";
import jose from "node-jose";

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

async function decryptSymmetricKey(encryptedMessage, privateKeyJwk) {
  try {
    // Initialize the JOSE library's key store
    const keystore = await jose.JWK.createKeyStore();
    // Add the private key to the key store
    const privateKey = await keystore.add(privateKeyJwk, "jwk");

    // Use node-jose to decrypt the message
    const result = await jose.JWE.createDecrypt(privateKey).decrypt(
      encryptedMessage
    );
    // The decrypted content is a Buffer, convert it to a string
    return result.payload.toString("utf8");
  } catch (error) {
    console.error("Decryption error with node-jose:", error);
    throw error;
  }
}

export const decryptMessage = async (message, user) => {
  // return message;
  // Decrypt the symmetric key using RSA-OAEP

  // get the private key from IndexedDB
  const privateKey = await getKey();

  // test asyumetric encryption
  const decryptedMessageTest = await decryptSymmetricKey(
    message.content,
    privateKey
  );

  message.content = decryptedMessageTest;

  return message;
};

export const decryptMessages = async (messages, user) => {
  const promises = messages.map(async (message) => {
    const decryptedMessage = await decryptMessage(message, user);
    return decryptedMessage;
  });
  return await Promise.all(promises);
};
