import { Injectable,ApplicationRef,ComponentRef,EnvironmentInjector,createComponent } from '@angular/core';
import { Messagebox } from '../../features/systemdesign/messagebox/messagebox';

export interface SectionComparison {
  currentSections: string[];
  addingSection: string;
}
@Injectable({
  providedIn: 'root'
})
export class Msgboxservice {
  
  private componentRef?: ComponentRef<Messagebox>;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  open(config: {
    title?: string;
    message: string;
    showCancel?: boolean;
    okText?: string;
    cancelText?: string;
    onOk?: () => void;
    onCancel?: () => void;
    type?: 'default' | 'unsaved' | 'warning' | 'error' | 'success';
    comparisonData?: SectionComparison;
    mode?: 'comparison' | 'required' | 'simple';
  }) {
    this.close();

    this.componentRef = createComponent(Messagebox, {
      environmentInjector: this.injector
    });

    const instance = this.componentRef.instance;
    instance.title = config.title ?? 'Message';
    instance.message = config.message;
    instance.showCancel = config.showCancel ?? true;
    instance.okText = config.okText ?? 'OK';
    instance.cancelText = config.cancelText ?? 'Cancel';
    instance.type = config.type ?? 'default';
    instance.comparisonData = config.comparisonData;
     instance.mode = config.mode ?? 'simple';

   
 instance.ok.subscribe(() => {
    this.close();          
    config.onOk?.();      
  });


    instance.cancel.subscribe(() => {
      config.onCancel?.();
      this.close();
    });

    this.appRef.attachView(this.componentRef.hostView);

    const domElem = (this.componentRef.hostView as any)
      .rootNodes[0] as HTMLElement;

    document.body.appendChild(domElem);
  }

  close() {
    if (this.componentRef) {
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = undefined;
    }
  }
}
