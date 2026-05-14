
/**
 * @fileOverview End-to-End Encryption utility using the Web Crypto API (AES-GCM).
 * This ensures data is encrypted on the client before reaching Firestore.
 */

const ALGORITHM = 'AES-GCM';

async function getMasterKey(userId: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(userId),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('digital-ghost-neural-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(text: string, userId: string): Promise<string> {
  try {
    const key = await getMasterKey(userId);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encoded = enc.encode(text);

    const ciphertext = await window.crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      encoded
    );

    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    const cipherHex = Array.from(new Uint8Array(ciphertext)).map(b => b.toString(16).padStart(2, '0')).join('');

    return `${ivHex}:${cipherHex}`;
  } catch (e) {
    console.error('Encryption failed', e);
    return text;
  }
}

export async function decryptData(encryptedStr: string, userId: string): Promise<string> {
  try {
    if (!encryptedStr.includes(':')) return encryptedStr;

    const [ivHex, cipherHex] = encryptedStr.split(':');
    const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    const ciphertext = new Uint8Array(cipherHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

    const key = await getMasterKey(userId);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (e) {
    console.error('Decryption failed', e);
    return '[Encrypted Content - Link Disrupted]';
  }
}
