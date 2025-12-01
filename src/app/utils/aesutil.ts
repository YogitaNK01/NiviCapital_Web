import { Injectable } from '@angular/core';

interface EncryptionResult {
  ciphertext: string;
  iv: string;
}

@Injectable({
  providedIn: 'root'
})
export class Aesutil {
   private static readonly IV_LENGTH = 12; // 96 bits
  private static readonly GCM_TAG_LENGTH = 16; // 128 bits = 16 bytes
  private requestIV: Uint8Array | null = null;

  //  Put your AES Base64 key here
  private readonly base64Key = 'K3t5B+9LPo6j1QxP+EybwzM7d4bF5HqR+MnY2yZ0SmI=';

  private generateIV(): Uint8Array {
    const ivArray = new Uint8Array(Aesutil.IV_LENGTH);
    crypto.getRandomValues(ivArray);
    return ivArray;
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    const buffer = new ArrayBuffer(bytes.byteLength);
    const view = new Uint8Array(buffer);
    view.set(bytes);
    return buffer;
  }

  async encrypt(
    plainText: string,
    options: { useSameIV?: boolean; existingBase64IV?: string } = {}
  ): Promise<EncryptionResult> {
    const { useSameIV = false, existingBase64IV } = options;
    let iv: Uint8Array;

    if (useSameIV) {
      if (this.requestIV === null) {
        iv = existingBase64IV
          ? this.base64ToUint8Array(existingBase64IV)
          : this.generateIV();
        this.requestIV = iv;
      } else {
        iv = this.requestIV;
      }
    } else {
      iv = existingBase64IV
        ? this.base64ToUint8Array(existingBase64IV)
        : this.generateIV();
    }

    const keyBytes = this.base64ToUint8Array(this.base64Key);

    if (keyBytes.length !== 32) {
      throw new Error('Invalid AES key length. Must be 32 bytes.');
    }

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      this.toArrayBuffer(keyBytes),
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    const plainBytes = new TextEncoder().encode(plainText);
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: this.toArrayBuffer(iv), tagLength: Aesutil.GCM_TAG_LENGTH * 8 },
      cryptoKey,
      plainBytes
    );

    const cipherBytes = new Uint8Array(encryptedBuffer);

    return {
      ciphertext: this.uint8ArrayToBase64(cipherBytes),
      iv: this.uint8ArrayToBase64(iv)
    };
  }

  async decrypt(base64Cipher: string, base64IV: string): Promise<string> {
    try {
      const keyBytes = this.base64ToUint8Array(this.base64Key);
      const iv = this.base64ToUint8Array(base64IV);
      const cipherBytes = this.base64ToUint8Array(base64Cipher);

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        this.toArrayBuffer(keyBytes),
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: this.toArrayBuffer(iv), tagLength: Aesutil.GCM_TAG_LENGTH * 8 },
        cryptoKey,
        this.toArrayBuffer(cipherBytes)
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`);
    }
  }

  clearRequestIV(): void {
    this.requestIV = null;
  }
}
