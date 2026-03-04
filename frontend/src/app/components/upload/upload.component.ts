import { Component, OnDestroy } from '@angular/core';
import { UploadService } from '../../services/upload.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-upload',
  imports: [ 
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatSnackBarModule,
    CommonModule
  ],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent implements OnDestroy{
  
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;
  isDragging = false;
  private destroy$ = new Subject<void>();
  
  constructor(private uploadService: UploadService, private snackBar: MatSnackBar) { }


  onFileSelected(event: any) {
     const file = event.target.files?.[0] || event.dataTransfer?.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.uploadProgress = 0; 
    }
    this.isDragging = false; 
  }

 upload() {
    
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    const interval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.isUploading = false;
        if (this.selectedFile) {
          this.uploadService.uploadFile(this.selectedFile).pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (event) => {
                if (event.type === HttpEventType.UploadProgress) {
                  this.uploadProgress = Math.round((event.loaded / (event.total || 1)) * 100 );
                  }

        if (event.type === HttpEventType.Response) {
          this.isUploading = false;
          this.uploadProgress = 100;
          this.snackBar.open('File uploaded successfully!', 'Close', {
            duration: 3000
          });

        }

      },
      error: () => {
        this.isUploading = false;
      }
      });
        }
      }
    }, 200);
   
  }
 
  removeSelectedFile() {
    this.selectedFile = null;
    this.uploadProgress = 0;
  }
  ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
}
