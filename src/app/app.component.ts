import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UndrrWidgetComponent } from './components/undrr-widget/undrr-widget.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UndrrWidgetComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Widget Embed Demo';
}
