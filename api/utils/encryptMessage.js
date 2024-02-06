const forge = require("node-forge");
const jose = require("node-jose");
const winston = require("winston");
const User = require("../models/User");

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: "debug_encrypt.log",
      level: "info",
    }),
  ],
});

function encryptSymmetricKeyOld(symmetricKey, publicKeyPem) {
  if (publicKeyPem.indexOf("-----BEGIN PUBLIC KEY-----") === -1) {
    jwk = JSON.parse(publicKeyPem);

    const key = forge.pki.setRsaPublicKey(
      forge.util.createBuffer(forge.util.hexToBytes(jwk.n)).toHex(),
      forge.util.createBuffer(forge.util.hexToBytes(jwk.e)).toHex()
    );
    publicKeyPem = forge.pki.publicKeyToPem(key);
  }
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encryptedKey = publicKey.encrypt(symmetricKey, "RSA-OAEP");
  return forge.util.encode64(encryptedKey);
}

async function encryptSymmetricKey(symmetricKey, publicKeyJwk) {
  try {
    const keyStore = jose.JWK.createKeyStore();
    const publicKey = await keyStore.add(publicKeyJwk, "json"); // Add the JWK to the keystore

    const options = {
      format: "compact", // Compact serialization of the encrypted content
      contentAlg: "A256GCM", // Encryption algorithm
    };

    const encrypted = await jose.JWE.createEncrypt(options, publicKey)
      .update(symmetricKey, "utf8")
      .final();

    return encrypted; // This is the encrypted message
  } catch (error) {
    logger.error(error);
  }
}

// Function to encrypt a message
async function encryptMessage(message, participants) {
  // return { encryptedMessage: message, encryptedSymmetricKeys: [] };
  logger.info(`message: ${message}`);
  logger.info(`participants: ${JSON.stringify(participants)}`);

  const participantUsers = await User.find({ _id: { $in: participants } });

  logger.info(`participantUsers: ${JSON.stringify(participantUsers)}`);
  logger.info(`participantUser publicKey: ${participantUsers[0].publicKey}`);

  const encryptedMessageTest = await encryptSymmetricKey(
    message,
    participantUsers[0].publicKey
  );
  // Testing asymetric encryption
  return { encryptedMessage: encryptedMessageTest, encryptedSymmetricKeys: [] };

  // Generate a random symmetric key for AES encryption
  const symmetricKey = forge.random.getBytesSync(16);
  const iv = forge.random.getBytesSync(16);

  logger.info(`symmetricKey: ${forge.util.encode64(symmetricKey)}`);
  logger.info(`iv: ${forge.util.encode64(iv)}`);

  // Encrypt the message using AES with the symmetric key
  const cipher = forge.cipher.createCipher("AES-CBC", symmetricKey);
  cipher.start({ iv: iv });
  cipher.update(forge.util.createBuffer(message));
  cipher.finish();
  const encryptedMessageBytes = cipher.output.getBytes();

  const symmetricKey64 = forge.util.encode64(symmetricKey);

  logger.info(`symmetricKey64: ${symmetricKey64}`);

  const encryptedSymmetricKeysmProm = participantUsers.map(async (user) => {
    // let encryptedKey = await encryptWithJWK(user.publicKey, symmetricKey);
    let encryptedKey = encryptSymmetricKey(symmetricKey64, user.publicKey);
    logger.info(`encryptedKey: ${encryptedKey}`);
    return {
      userId: user._id.toString(),
      encryptedKey: encryptedKey, // in jwk format
      iv: forge.util.encode64(iv), // in base64 format
    };
  });

  const encryptedSymmetricKeys = await Promise.all(encryptedSymmetricKeysmProm);

  logger.info(
    `encryptedSymmetricKeys: ${JSON.stringify(encryptedSymmetricKeys)}`
  );

  // prepare bytes for storage
  const encryptedMessage = forge.util.encode64(encryptedMessageBytes);

  // Return the encrypted message and encrypted symmetric key
  return { encryptedMessage, encryptedSymmetricKeys };
}

module.exports = { encryptMessage };
