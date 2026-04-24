import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Buttons } from '../buttons/buttons';
import { Loanstepperservice } from '../../../core/service/loanstepperservice';

type MessageType = 'default' | 'unsaved' | 'warning' | 'error' | 'success';


export interface SectionComparison {
  currentSections: string[];
  addingSection: string;
}

@Component({
  selector: 'app-messagebox',
  imports: [CommonModule, Buttons],
  standalone: true,
  templateUrl: './messagebox.html',
  styleUrl: './messagebox.scss'
})
export class Messagebox {

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() type: 'default' | 'unsaved' | 'warning' | 'error' | 'success' = 'default';

  @Input() title = 'Message';
  @Input() message = '';

  @Input() showCancel = true;
  @Input() okText = 'OK';
  @Input() cancelText = 'Cancel';

  @Output() ok = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  // @Input() comparisonData?: SectionComparison;
  
@Input() comparisonData?: {
  currentSections: string[];
  addingSection: string;
};
  private educationRankMap: Record<string, number> = {
  '10th': 1,
  '12th': 2,
  'diploma10':3,
  'diploma12':4,
  'Undergraduate': 5,
  'Postgraduate': 6,
  'ielts':7,
  'offerletter':8,
  'others12':9,
  'othersdiploma':10
  

};
constructor(private stepperService:Loanstepperservice){}
  onOk1() {
    this.ok.emit();
    // this.close.emit();
  }

  onCancel1() {
    this.cancel.emit();
    // this.close.emit();
  }
  onOk() {
    this.ok.emit();
    this.close();
  }

  onCancel() {
    this.cancel.emit();
    this.close();
  }

  onClose() {
    this.cancel.emit();
    this.close();
  }

  private close() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('msgbox-backdrop')) {
      this.onClose();
    }
  }

  isSectionKept(section: string, addingSection: string): boolean {
  const current = this.normalizeSectionLabel(section);
  const adding = this.normalizeSectionLabel(addingSection);

  const currentRank = this.educationRankMap[current] ?? 999;
  const addingRank = this.educationRankMap[adding] ?? 999;

  return currentRank < addingRank;
}

isSectionCompleted(sectionLabel: string): boolean {
  const stepKey = this.normalizeQualification(sectionLabel);
  return this.stepperService
    .getCompletedEducationSections()
    .has(stepKey);
}

shouldShowTick(section: string, addingSection: string): boolean {
  const filled = this.isSectionCompleted(section);
  const kept = this.isSectionKept(section, addingSection);
  return filled && kept;
}

private normalizeSectionLabel(label: string): string {
  return label
    .replace(/\(.*?\)/g, '')
    .trim();
}
  get isDanger(): boolean {
    return this.type === 'unsaved' || this.type === 'error';
  }

  get showIcon(): boolean {
  return this.type === 'unsaved' || this.type === 'warning';
}

 get showComparison(): boolean {
    return !!this.comparisonData;
  }

  normalizeQualification(name: string): string {
    const lower = name.toLowerCase();

    // School
    if (lower === '10th') return '10th';
    if (lower === '12th') return '12th';

    // Diploma
    if (lower.includes('diploma') && lower.includes('10')) return 'diploma10';
    if (lower.includes('diploma') && lower.includes('12')) return 'diploma12';


    // Others (must come BEFORE generic "other")
    if (lower.includes('others') && lower.includes('after 12th')) return 'others12';
    if (lower.includes('others') && lower.includes('diploma')) return 'othersdiploma';


    //PG
    if (lower.includes('postgraduate') || lower.includes('pg') || lower.includes('master')) return 'pg';

    // UG 
    if (lower.includes('undergraduate') || lower.includes('ug') || lower.includes('bachelor')) return 'ug';

    if (lower.includes('ielts') || lower.includes('pte')) return 'ielts';
    if (lower.includes('offer')) return 'offerletter';
    if (lower.includes('other')) return 'others';


    return 'others';


  }

}
