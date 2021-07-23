import { Component, OnInit } from '@angular/core';
import { MapMyIndiaService } from '../map-my-india/map-my-india.service';

@Component({
  selector: 'app-location-autosuggest',
  templateUrl: './location-autosuggest.component.html',
  styleUrls: ['./location-autosuggest.component.scss'],
})
export class LocationAutosuggestComponent implements OnInit {

  constructor(private mapService: MapMyIndiaService) { }

  ngOnInit() {}

  onValueChanged(event: any){
    const enteredText = event.target.value;
    this.mapService.autoSuggest(enteredText).subscribe(
      response => {
        console.log(response);
      }
    )
  }

}
