import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { UtilSvc } from '../utilities/utilSvc';
import { UserInfo } from '../app.globals';
import { DataSvc, LOCATION_TABLE_NAME } from '../model/dataSvc'

    // COMPONENT for MANAGE LOCATIONS feature

@Component({
  templateUrl: 'location.list.component.html'
})
export class LocationListComponent implements OnInit {
  constructor(private user: UserInfo, private utilSvc: UtilSvc, private dataSvc: DataSvc){
  };


  itemName  = "";
  action    = "";
  checkAll            : boolean   = false; //true if form fields to be checked for errors (touched or not)

  selectedItem        : string    = "";
  newItemName         : string    = "";
  deleteItem          : boolean   = false;
  itemList            : string[]  = [];
  requestStatus       : { [key: string]: any }  = {};
  working             : boolean   = false;
  formOpen            : boolean   = false;
  formWasOpen         : boolean   = false;

  ngOnInit() {
  // make the user log in to manage lists
    if (!this.user.authData) {
      this.utilSvc.returnToHomeMsg("signInToAccessLists"); // let user know they need to log in
    }
    else{
      // update the current help context and open the Event Management form
      this.utilSvc.setCurrentHelpContext("ManageLocations"); // note current state
      this.utilSvc.displayUserMessages();;
      this.dataSvc.getList(LOCATION_TABLE_NAME)
      .then((list) => {
          this.itemList = <string[]>list;
          this.formOpen = true;
          this.formWasOpen = true;
      })
      .catch((error) => {
          this.utilSvc.displayThisUserMessage("noLocationsFound");
          this.itemList = [];
          this.formOpen = true;
          this.formWasOpen = true;
      });
    }
  }

  // delete the item that has been selected
  deleteSelectedItem = (form : NgForm) => {
    this.deleteItem = true;
    this.submitRequest(form)
  }

  // prepare and send request to database service
  submitRequest(form : NgForm) : void {
    var msg   : string, 
        msgId : string,
        action: string;

    this.checkAll = true;
    this.clearRequestStatus();
    if(this.checkForProblems(form)){   // can't do anything yet, form still has errors
      return;
    }
    this.working = true;
    this.itemName = this.newItemName;
    msg = "Location " + "'" + this.itemName + "'";
    // now set the action to perform and the status message for the user
    if(this.selectedItem == "999"){  // user specify new item name?
      msgId = "listItemAdded";
      action = "Add";
    } 
    else {
      if(!this.deleteItem){
        msgId = "listItemUpdated";
        action = "Update";
      } else {
        msgId = "listItemRemoved";
        action = "Remove";
      }
    }
    this.dataSvc.updateList(LOCATION_TABLE_NAME, this.itemName, action, parseInt(this.selectedItem))   // send the update
    .then((success) => {
      this.utilSvc.setUserMessage(msgId, msg);
      this.utilSvc.displayUserMessages();
      this.resetForm(form);
      this.dataSvc.getList(LOCATION_TABLE_NAME)  // re-read the list
      .then((list) => {
        this.requestStatus.updateSuccess = true;
        this.itemList = <string[]>list;
        this.working = false;
      })
      .catch((error) => {
          this.utilSvc.displayThisUserMessage("errorReadingLocationList");
          this.working = false;
      });
    })
    .catch((error) => {
        this.utilSvc.displayThisUserMessage("errorUpdatingLocationList");
        this.resetForm(form);
        this.working = false;
    });
  }

  // user has selected a list entry, copy it to the edit field
  copyItemName = () => {
    setTimeout( () => {
      if(this.selectedItem != "999"){
        this.newItemName = this.itemList[this.selectedItem];
      }
      else{
        this.newItemName = "";
      }
    }, 50);
  }

  // get the form ready for another operation
  resetForm(form : NgForm) : void {
    if(form){
      form.resetForm();
      // document.getElementById("deleteCheckBox").focus();
    }
    this.checkAll = false;
    this.selectedItem = "";
    this.deleteItem   = false;
    this.newItemName  = "";
  }

  // return whether the selecteditem value is a valid id number
  canDeleteItem = () => {
    return ((this.selectedItem != "") && (this.selectedItem != "999"));
  } 

  // clear status messages object
  clearRequestStatus = () => {
    this.requestStatus = {};
  }

  //indicate whether there are any status messages
  haveStatusMessages = () => {
    return Object.keys(this.requestStatus).length !== 0;
  }

  // return true if there is something wrong with the form input
  checkForProblems(form: NgForm) : boolean {
    if(form.invalid){
       this.requestStatus.formHasErrors = true;
      return true;
    }
    return this.selectedItem == "";
 }

  // set form closed flag, wait for animation to complete before changing states to 'home'
  closeForm = () => {
    this.formOpen = false;
    this.utilSvc.returnToHomeState(400);
  }
}
