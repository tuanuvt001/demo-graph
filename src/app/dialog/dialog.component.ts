import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {icons} from '../../assets/icons';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

  node: any;
  icons = icons;
  type = 'node';

  constructor(public modal: NgbActiveModal) {
  }

  ngOnInit(): void {
  }

}
