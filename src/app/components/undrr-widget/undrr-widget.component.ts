import { Component, AfterViewInit } from '@angular/core';
import { ScriptLoaderService } from '../../services/script-loader.service';

@Component({
  standalone: true,
  selector: 'app-undrr-widget',
  template: `<section class="pw-widget-sfm-page">Loading...</section>`,
  styles: [`
    .pw-widget-sfm-page {
      min-height: 100px;
      border: 3px solid red;
    }
  `],
  providers: [ScriptLoaderService]
})
export class UndrrWidgetComponent implements AfterViewInit {
  private scriptUrl = 'https://publish.preventionweb.net/widget.js?rand=3d797b';
  private nonce = '20240509121740'; // If required by CSP

  constructor(private scriptLoader: ScriptLoaderService) {}

  async ngAfterViewInit() {
    try {
      await this.scriptLoader.loadScript(this.scriptUrl, this.nonce);

      const pwWidget = (window as any).PW_Widget;

      if (pwWidget) {
        pwWidget.initialize({
          contenttype: 'landingpage',
          pageid: '92409',
          includemetatags: false,
          includecss: true,
          suffixID: 'sfm-page',
          activedomain: 'www.preventionweb.net'
        });
      } else {
        console.error('PW_Widget is not available');
      }
    } catch (error) {
      console.error(error);
    }
  }
}
