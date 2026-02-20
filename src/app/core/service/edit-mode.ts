import { Injectable, signal } from '@angular/core';

export type FormMode = 'view' | 'edit' | 'add';
   
@Injectable({
  providedIn: 'root'
})
export class EditMode {
  
   private _mode = signal<FormMode>('view');
  mode = this._mode.asReadonly();

  private _isAdd = signal(false);
  isAdd = this._isAdd.asReadonly();

  setAddMode(isAdd: boolean) {
    this._isAdd.set(isAdd);
  }
  
  view() {
    this._mode.set('view');
  }

  edit() {
    this._mode.set('edit');
  }

  add() {
    this._mode.set('add');
  }

  toggleEdit() {
    this._mode.set(this._mode() === 'edit' ? 'view' : 'edit');
  }
  setMode(mode: FormMode) {
    this._mode.set(mode);
  }
}
