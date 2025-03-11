import { Component, AfterViewInit, Input } from '@angular/core';
import { ScriptLoaderService } from '../../services/script-loader.service';

@Component({
  standalone: true,
  selector: 'app-undrr-widget',
  template: `<section
    class="pw-widget"
    [class]="'undrr-widget pw-widget-' + suffixID"
  >
    Loading... {{ suffixID }}
  </section>`,
  styles: [
    `
      .undrr-widget {
        min-height: 100px;
        border: 2px solid red;
        padding: 2rem;
        margin: 2rem;
      }
    `,
  ],
  providers: [ScriptLoaderService],
})
export class UndrrWidgetComponent implements AfterViewInit {
  @Input() pageid!: string; // ✅ Accept pageid as input
  @Input() suffixID!: string; // ✅ Accept suffixID as input

  private scriptUrl = 'https://publish.preventionweb.net/widget.js?rand=3d797b';
  private nonce = '20240509121740'; // If required by CSP

  constructor(private scriptLoader: ScriptLoaderService) {}

  async ngAfterViewInit() {
    try {
      await this.scriptLoader.loadScript(this.scriptUrl, this.nonce);

      const pwWidget = (window as any).PW_Widget;

      if (pwWidget && typeof pwWidget.initialize === 'function') {
        pwWidget.initialize({
          contenttype: 'landingpage',
          pageid: this.pageid,
          includemetatags: false,
          includecss: true,
          suffixID: this.suffixID,
          activedomain: 'www.preventionweb.net',
        });
      } else {
        console.error('PW_Widget is not available or not a function');
      }
    } catch (error) {
      console.error(error);
    }
  }
}
