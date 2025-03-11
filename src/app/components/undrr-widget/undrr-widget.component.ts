import {
  Component,
  AfterViewInit,
  Input,
  Renderer2,
  ElementRef,
} from '@angular/core';

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
})
export class UndrrWidgetComponent implements AfterViewInit {
  @Input() pageid!: string;
  @Input() suffixID!: string;

  private scriptUrl = 'assets/js/widget.js';

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  ngAfterViewInit() {
    const script = this.renderer.createElement('script');
    script.src = this.scriptUrl;
    script.type = 'text/javascript';
    script.onload = () => {
      const pwWidget = (window as any).PW_Widget;
      if (pwWidget && typeof pwWidget.initialize === 'function') {
        pwWidget.initialize({
          contenttype: 'landingpage',
          pageid: this.pageid,
          includemetatags: false,
          includecss: false,
          suffixID: this.suffixID,
          activedomain: 'www.preventionweb.net',
        });
      } else {
        console.error('PW_Widget is not available or not a function');
      }
    };
    script.onerror = () => console.error('Failed to load local widget.js');

    this.renderer.appendChild(this.el.nativeElement, script);
  }
}
