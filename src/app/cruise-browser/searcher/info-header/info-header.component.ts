import { Component, OnInit } from '@angular/core';
import { CruceroService } from 'src/app/services/DataServices/crucero.service';

@Component({
  selector: 'app-info-header',
  templateUrl: './info-header.component.html',
  styleUrls: ['./info-header.component.scss']
})
export class InfoHeaderComponent implements OnInit {

  constructor(private crucero: CruceroService) { }

  ngOnInit() {
  }

}
