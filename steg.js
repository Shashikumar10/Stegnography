const crypto = require('crypto');

// ===== AES helpers =====
function getAESKey(password) {
    return crypto.createHash('sha256').update(password).digest(); // 32-byte key
}

function encryptAES(messageBuffer, password) {
    const key = getAESKey(password);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(messageBuffer), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]); // IV + TAG + DATA
}

function decryptAES(encryptedBuffer, password) {
    const key = getAESKey(password);
    const iv = encryptedBuffer.slice(0, 16);
    const tag = encryptedBuffer.slice(16, 32);
    const data = encryptedBuffer.slice(32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]);
}

// ===== Steganography =====
function embedMessage(masterBuffer, message, password) {
    let messageBuffer = Buffer.from(message, 'utf8');
    messageBuffer = encryptAES(messageBuffer, password); // always encrypt
    const marker = Buffer.from('STEGO123');
    return Buffer.concat([masterBuffer, marker, messageBuffer]);
}

function extractMessage(stegoBuffer, password) {
    const marker = Buffer.from('STEGO123');
    const markerIndex = stegoBuffer.indexOf(marker);
    if (markerIndex === -1) throw new Error("No hidden message found");
    const messageBuffer = stegoBuffer.slice(markerIndex + marker.length);
    return decryptAES(messageBuffer, password).toString('utf8'); // always decrypt
}

module.exports = { embedMessage, extractMessage };
