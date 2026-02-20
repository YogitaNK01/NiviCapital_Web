import { ChangeDetectorRef, effect, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EditMode } from '../../../../core/service/edit-mode';

export abstract class BaseAddForm<T extends Record<string, any>> {

  protected editMode = inject(EditMode);
  protected cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  data!: T;

  constructor() {
    effect(() => {
      if (this.editMode.isAdd()) {
        this.data = this.getEmptyData();
        this.buildForm();
      }
      this.cdr.markForCheck();
    });
  }

  /** child must provide empty object */
  protected abstract getEmptyData(): T;

  /** child must provide field config */
  protected abstract getFields(): { key: string }[];

  /** 🔥 COMMON FOR ALL COMPONENTS */
  protected buildForm() {
    const group: Record<string, FormControl> = {};

    this.getFields().forEach(field => {
      group[field.key] = new FormControl(this.data?.[field.key] ?? '');
    });

    this.form = new FormGroup(group);
  }

  getFormValue() {
    return this.form.getRawValue();
  }
}
