import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  private readonly SECRET ='1nj12rPWeN4p2Jpk39cQ7GsYAZR8ZK14';


  private encoder = new TextEncoder();
  private decoder = new TextDecoder();

  private async getKey(): Promise<CryptoKey> {

    return crypto.subtle.importKey(
      'raw',
      this.encoder.encode(this.SECRET),
      'AES-GCM',
      false,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(value: string): Promise<string> {

    const iv = crypto.getRandomValues(
      new Uint8Array(12)
    );

    const key = await this.getKey();

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      this.encoder.encode(value)
    );

    const encryptedBytes =
      new Uint8Array(encrypted);

    const result = new Uint8Array(
      iv.length + encryptedBytes.length
    );

    result.set(iv, 0);
    result.set(encryptedBytes, iv.length);

    return btoa(
      String.fromCharCode(...result)
    );
  }

  async decrypt(base64: string): Promise<string> {

    const combined = Uint8Array.from(
      atob(base64),
      c => c.charCodeAt(0)
    );

    const iv = combined.slice(0, 12);

    const cipherText =
      combined.slice(12);

    const key = await this.getKey();

    const decrypted =
      await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        cipherText
      );

    return this.decoder.decode(decrypted);
  }
}
