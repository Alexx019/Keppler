import { Component, signal } from '@angular/core';
import { MapComponent } from './components/map/map';
import { Hud } from "./components/hud/hud";

@Component({
  selector: 'app-root',
  imports: [MapComponent, Hud],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('keppler-frontend');
}
