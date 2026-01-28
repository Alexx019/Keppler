import { Component, signal } from '@angular/core';
import { MapComponent } from './components/map/map';

@Component({
  selector: 'app-root',
  imports: [MapComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('keppler-frontend');
}
