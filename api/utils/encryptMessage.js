const forge = require("node-forge");
const jose = require("node-jose");
const winston = require("winston");
const User = require("../models/User");

const logger = winston.createLogger({
  transports: [
    // new winston.transports.File({
    //   filename: "debug_encrypt.log",
    //   level: "info",
    // }),
    new winston.transports.Console(),
  ],
});

async function generateSymmetricKey() {
  try {
    // Create an empty keystore
    let keystore = jose.JWK.createKeyStore();

    // Generate a new symmetric key
    // Parameters: key type, key size in bits, and any additional properties
    const key = await keystore.generate("oct", 256, {
      alg: "A256GCM",
      use: "enc",
    });

    // The generated key is a JWK
    console.log("Generated Symmetric Key:", key.toJSON(true));

    return key;
  } catch (error) {
    console.error("Error generating symmetric key:", error);
  }
}

async function encryptSymmetricKey(symmetricKey, publicKeyJwk) {
  logger.info(`encryptSymmetricKey symmetricKey param: ${symmetricKey}`);
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
    logger.error(`Error encrypting symetric key: ${error}`);
  }
}

async function encryptMessageWithSymmetricKey(message, symmetricKey) {
  let encrypted;
  let key;

  try {
    // Convert the symmetric key into a format that node-jose can use
    // key = await jose.JWK.asKey(symmetricKey, "oct");
    key = symmetricKey;
  } catch (error) {
    logger.error(`Error jose converting symmetric key: ${error}`);
  }

  try {
    // Encrypt the message
    encrypted = await jose.JWE.createEncrypt({ format: "compact" }, key)
      .update(message)
      .final();
  } catch (error) {
    logger.error(`Error jose creating encrypt: ${error}`);
  }

  return encrypted;
}

// Function to encrypt a message
async function encryptMessage(message, participants) {
  // return { encryptedMessage: message, encryptedSymmetricKeys: [] };
  logger.info(`message: ${message}`);
  logger.info(`participants: ${JSON.stringify(participants)}`);

  const participantUsers = await User.find({ _id: { $in: participants } });

  logger.info(`participantUsers: ${JSON.stringify(participantUsers)}`);
  logger.info(`participantUser publicKey: ${participantUsers[0].publicKey}`);

  // const encryptedMessageTest = await encryptSymmetricKey(
  //   message,
  //   participantUsers[0].publicKey
  // );
  // Testing asymetric encryption
  //return { encryptedMessage: encryptedMessageTest, encryptedSymmetricKeys: [] };

  let symmetricKey;
  // Generate a random symmetric key for AES encryption
  try {
    symmetricKey = await generateSymmetricKey();
  } catch (e) {
    logger.error(`Error encoding symmetric key: ${e}`);
  }

  let encryptedMessage;
  let encryptedSymmetricKeys;

  try {
    encryptedMessage = await encryptMessageWithSymmetricKey(
      message,
      symmetricKey
    );
  } catch (error) {
    logger.error(`Error encrypting message: ${error}`);
  }

  if (!encryptedMessage) {
    throw new Error("Error encrypting message");
  }

  const symmetricKeyJwk = JSON.stringify(symmetricKey.toJSON(true));

  try {
    // Encrypt the symmetric key for each participant
    encryptedSymmetricKeys = await Promise.all(
      participantUsers.map(async (user) => {
        const encryptedKey = await encryptSymmetricKey(
          symmetricKeyJwk,
          user.publicKey
        );
        return { userId: user._id.toString(), encryptedKey };
      })
    );
  } catch (e) {
    logger.error(`Error encoding symmetric key: ${e}`);
  }

  // Return the encrypted message and encrypted symmetric key
  return {
    encryptedMessage,
    encryptedSymmetricKeys: JSON.stringify(encryptedSymmetricKeys),
  };
}

module.exports = { encryptMessage };
