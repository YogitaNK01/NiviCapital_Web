import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EditMode {
  
   private _editMode = signal(false);

  editMode = this._editMode.asReadonly();

  enable() {
    this._editMode.set(true);
  }

  disable() {
    this._editMode.set(false);
  }

  toggle() {
    this._editMode.set(!this._editMode());
  }
  
}
