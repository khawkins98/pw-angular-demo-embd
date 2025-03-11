import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ScriptLoaderService {
  private scripts: { [key: string]: boolean } = {};

  loadScript(src: string, nonce?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.scripts[src]) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.async = true;
      if (nonce) {
        script.setAttribute('nonce', nonce);
      }

      script.onload = () => {
        this.scripts[src] = true;
        resolve();
      };

      script.onerror = () => reject(`Error loading script: ${src}`);

      document.body.appendChild(script);
    });
  }
}
