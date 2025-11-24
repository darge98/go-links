import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GoLinkFormComponent } from '../../components/golink-form/golink-form.component';
import { GoLinkService } from '../../services/golink.service';
import { GoLink } from '../../models/golink.model';

@Component({
  selector: 'app-edit-golink',
  standalone: true,
  imports: [CommonModule, GoLinkFormComponent],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Edit GoLink</h1>
      
      @if (initialData()) {
        <app-golink-form
          [initialData]="initialData()"
          [isLoading]="isLoading()"
          [errorMessage]="errorMessage()"
          [showDelete]="true"
          (save)="onSave($event)"
          (cancel)="onCancel()"
          (delete)="onDelete()"
        ></app-golink-form>
      } @else {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditGoLinkComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(GoLinkService);

  readonly initialData = signal<GoLink | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.getById(id).subscribe({
        next: (data) => this.initialData.set(data),
        error: (err) => {
          console.error('Load error:', err);
          this.router.navigate(['/']);
        }
      });
    } else {
      this.router.navigate(['/']);
    }
  }

  onSave(data: Partial<GoLink>) {
    const current = this.initialData();
    if (!current) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.service.update(current.id, data, current.lockUuid).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 409) {
          this.errorMessage.set('This GoLink was modified by someone else. Please refresh and try again.');
        } else {
          this.errorMessage.set('Failed to update GoLink. Please try again.');
        }
        console.error('Update error:', err);
      }
    });
  }

  onDelete() {
    const current = this.initialData();
    if (!current) return;

    this.isLoading.set(true);
    this.service.delete(current.id).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to delete GoLink.');
        console.error('Delete error:', err);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/']);
  }
}
