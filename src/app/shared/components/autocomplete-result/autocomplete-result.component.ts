import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-autocomplete-result',
  templateUrl: './autocomplete-result.component.html',
  styleUrls: ['./autocomplete-result.component.scss'],
})
export class AutocompleteResultComponent implements OnInit {
  @Input() autocompleteResult: any[];

  constructor() { }

  ngOnInit() {}

}
