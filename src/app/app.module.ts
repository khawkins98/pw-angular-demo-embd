import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { UndrrWidgetComponent } from './components/undrr-widget/undrr-widget.component';

@NgModule({
  declarations: [
    AppComponent,
    UndrrWidgetComponent,
  ],
  imports: [BrowserModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
