import {Injectable} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DialogComponent} from './dialog/dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private ngbModal: NgbModal) {
  }

  openNodeModal(node) {
    const ref = this.ngbModal.open(DialogComponent, {size: 'lg'});
    ref.componentInstance.node = node;
  }

  openLinkModal(link: any) {
    const ref = this.ngbModal.open(DialogComponent, {size: 'lg'});
    ref.componentInstance.node = link;
    ref.componentInstance.type = 'link';
  }
}
