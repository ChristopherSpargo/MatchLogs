import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgForm } from "@angular/forms";

@Component({
  selector: '<app-delete-entry>',
  templateUrl : 'delete.entry.component.html'
})
export class DeleteEntryComponent  {

  @Input() fValue       : boolean;  // where the delete status is stored
  @Input() fCanDelete   : Function;  // boolean indicates whether item can be deleted
  @Output() fValueChange = new EventEmitter<boolean>();

  constructor() {
  };

  valueChange = ()=> {
    this.fValueChange.emit(this.fValue);
  }
}