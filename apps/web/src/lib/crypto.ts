/**
 * Crypto Utilities for End-to-End Encryption (E2EE)
 * Uses Web Crypto API for secure key management and encryption.
 */

export interface KeyPair {
    publicKey: CryptoKey;
    privateKey: CryptoKey;
}

/**
 * Generates an ECDH key pair for the user.
 */
export async function generateKeyPair(): Promise<KeyPair> {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: 'ECDH',
            namedCurve: 'P-256',
        },
        true, // extractable
        ['deriveKey', 'deriveBits']
    );
    return keyPair as KeyPair;
}

/**
 * Exports a public key to a base64-encoded string for storage in Supabase.
 */
export async function exportPublicKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('spki', key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Imports a public key from a base64-encoded string.
 */
export async function importPublicKey(keyData: string): Promise<CryptoKey> {
    const binaryDerString = window.atob(keyData);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
    }
    return await window.crypto.subtle.importKey(
        'spki',
        binaryDer.buffer,
        {
            name: 'ECDH',
            namedCurve: 'P-256',
        },
        true,
        []
    );
}

/**
 * Derives a symmetric AES-GCM key from a private key and a remote public key.
 */
export async function deriveSymmetricKey(
    privateKey: CryptoKey,
    remotePublicKey: CryptoKey
): Promise<CryptoKey> {
    return await window.crypto.subtle.deriveKey(
        {
            name: 'ECDH',
            public: remotePublicKey,
        },
        privateKey,
        {
            name: 'AES-GCM',
            length: 256,
        },
        false, // not extractable
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypts content using AES-GCM with a specific IV.
 */
export async function encryptContent(
    content: string,
    key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedContent = new TextEncoder().encode(content);

    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        key,
        encodedContent
    );

    return {
        ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
        iv: btoa(String.fromCharCode(...iv)),
    };
}

/**
 * Decrypts content using AES-GCM and a provided IV.
 */
export async function decryptContent(
    ciphertext: string,
    iv: string,
    key: CryptoKey
): Promise<string> {
    const binaryIv = new Uint8Array(
        atob(iv).split('').map((c) => c.charCodeAt(0))
    );
    const binaryCiphertext = new Uint8Array(
        atob(ciphertext).split('').map((c) => c.charCodeAt(0))
    );

    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: binaryIv,
        },
        key,
        binaryCiphertext
    );

    return new TextDecoder().decode(decrypted);
}

/**
 * Generates a random session key (symmetric) for a chat room.
 */
export async function generateSessionKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256,
        },
        true, // must be extractable so we can encrypt it for others
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypts a symmetric session key with a user's public key (Key Wrapping).
 * Note: Since ECDH doesn't support direct RSA-like encryption, we derive a temporary key.
 */
export async function wrapSessionKey(
    sessionKey: CryptoKey,
    recipientPublicKey: CryptoKey,
    senderPrivateKey: CryptoKey
): Promise<string> {
    const derivedWrapperKey = await deriveSymmetricKey(senderPrivateKey, recipientPublicKey);
    const rawSessionKey = await window.crypto.subtle.exportKey('raw', sessionKey);

    const { ciphertext, iv } = await encryptContent(
        btoa(String.fromCharCode(...new Uint8Array(rawSessionKey))),
        derivedWrapperKey
    );

    // Return combined IV and Ciphertext
    return JSON.stringify({ ciphertext, iv });
}

/**
 * Decrypts (unwraps) a symmetric session key using user's private key.
 */
export async function unwrapSessionKey(
    wrappedKeyJson: string,
    senderPublicKey: CryptoKey,
    recipientPrivateKey: CryptoKey
): Promise<CryptoKey> {
    const { ciphertext, iv } = JSON.parse(wrappedKeyJson);
    const derivedWrapperKey = await deriveSymmetricKey(recipientPrivateKey, senderPublicKey);

    const decryptedRawBase64 = await decryptContent(ciphertext, iv, derivedWrapperKey);
    const binaryRaw = new Uint8Array(
        atob(decryptedRawBase64).split('').map((c) => c.charCodeAt(0))
    );

    return await window.crypto.subtle.importKey(
        'raw',
        binaryRaw.buffer,
        'AES-GCM',
        true,
        ['encrypt', 'decrypt']
    );
}
