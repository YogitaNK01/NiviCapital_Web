import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, input } from '@angular/core';
import { Msgboxservice } from '../../../core/service/msgboxservice';
import { Router } from '@angular/router';

export type UploadState = 'idle' | 'focus' | 'uploading' | 'success' | 'error' | 'disabled';

export interface UploadConfig {
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  helperText?: string;
}

export interface UploadResult {
  file: File | null;
  preview?: string;
  error?: string;
}

@Component({
  selector: 'app-uploadbtn',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './uploadbtn.html',
  styleUrl: './uploadbtn.scss'
})
export class Uploadbtn implements OnInit {
  @Input() config: UploadConfig = {
    accept: '.svg, .png, .jpg, .jpeg, .pdf, .tiff, .heic',
    maxSize: 10,
    helperText: 'JPG, JPEG, PDF, PNG, TIFF, SVG, HEIC (max. 10 MB)'
  };

  @Input() disabled: boolean = false;
  @Input() value: File | null = null;
  @Input() previewUrl: string = '';
  @Input() label: string = '';
  @Input() required: boolean = false;

  @Output() fileChange = new EventEmitter<UploadResult>();
  @Output() fileRemove = new EventEmitter<void>();

  state: UploadState = 'idle';
  progress: number = 0;
  fileName: string = '';
  errorMessage: string = '';
  preview: string = '';
  private fileInput: HTMLInputElement | null = null;

  showHelperMessage = true;
  private helperTimer?: number;


  constructor(private router: Router, private msgBox: Msgboxservice) { }

  ngOnInit() {
    if (this.disabled) {
      this.state = 'disabled';
    }
    if (this.value) {
      this.fileName = this.value.name;
      this.state = 'success';
    }
    if (this.previewUrl) {
      this.preview = this.previewUrl;
      this.state = 'success';
    }
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.processFile(file);
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.state = 'idle';

    if (this.disabled) return;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled && this.state !== 'success') {
      this.state = 'focus';
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (this.state === 'focus') {
      this.state = 'idle';
    }
  }

  processFile(file: File) {
    // Validate file type
    const validTypes = this.config.accept?.split(',').map(t => t.trim()) || [];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = validTypes.some(type =>
      type === fileExt || type === file.type
    );

    if (!isValidType) {
      this.setError(`Invalid file format. Only ${this.config.accept} are accepted.`);
      return;
    }

    // Validate file size
    const maxSizeBytes = (this.config.maxSize || 10) * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      this.setError(`File size exceeds ${this.config.maxSize} MB`);
      return;
    }

    this.fileName = file.name;
    this.uploadFile(file);
  }

  uploadFile(file: File) {
    this.state = 'uploading';
    this.progress = 0;
    this.errorMessage = '';

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.preview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }

    // Simulate upload progress
    const interval = setInterval(() => {
      this.progress += 10;
      if (this.progress >= 100) {
        clearInterval(interval);
        this.state = 'success';
        this.showHelperMessage = true;
        this.fileChange.emit({
          file: file,
          preview: this.preview
        });
        this.hideHelperMessageAfterDelay();
      }

    }, 200);


    // For real upload, replace above with actual HTTP request:
    /*
    this.uploadService.upload(file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progress = Math.round(100 * event.loaded / event.total!);
        } else if (event.type === HttpEventType.Response) {
          this.state = 'success';
          this.fileChange.emit({
            file: file,
            preview: this.preview
          });
        }
      },
      error: (err) => {
        this.setError('Upload failed. Please try again.');
      }
    });
    */
  }

  setError(message: string) {
    this.state = 'error';
    this.errorMessage = message;
    this.showHelperMessage = true;
    this.fileChange.emit({
      file: null,
      error: message
    });
    this.hideHelperMessageAfterDelay();
  }

  removeFile() {
    this.msgBox.open({
      title: 'Are you sure want to Delete',
      message: 'Once deleted, this description cannot be recovered.',
      showCancel: true,
      onOk: () => {
        this.state = 'idle';
        this.fileName = '';
        this.preview = '';
        this.progress = 0;
        this.errorMessage = '';

        if (this.fileInput) {
          this.fileInput.value = '';
        }
        this.fileRemove.emit();
      }
    });


  }

  triggerFileInput() {
    if (!this.disabled && this.state !== 'success') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = this.config.accept || '';
      input.onchange = (e) => this.onFileSelect(e);
      input.click();
      this.fileInput = input;
    }
  }

  getStateClass(): string {
    return `upload-${this.state}`;
  }



  private hideHelperMessageAfterDelay(delay = 5000) {
    if (this.helperTimer) {
      clearTimeout(this.helperTimer);
    }

    this.helperTimer = window.setTimeout(() => {
      this.showHelperMessage = false;
    }, delay);
  }



}
