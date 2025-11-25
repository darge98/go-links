import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GoLinkFormComponent } from '../../components/golink-form/golink-form.component';
import { GoLinkService } from '../../services/golink.service';
import { AnalyticsService } from '../../../analytics/services/analytics.service';
import { GoLink } from '../../models/golink.model';

@Component({
  selector: 'app-edit-golink',
  standalone: true,
  imports: [CommonModule, GoLinkFormComponent],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Edit GoLink</h1>
        @if (clickCount() !== null) {
          <div class="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
            <span class="text-sm text-blue-600 font-medium uppercase tracking-wider">Total Clicks</span>
            <div class="text-2xl font-bold text-blue-900">{{ clickCount() }}</div>
          </div>
        }
      </div>
      
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
  private readonly analyticsService = inject(AnalyticsService);

  readonly initialData = signal<GoLink | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly clickCount = signal<number | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.service.getById(id).subscribe({
        next: (data) => {
          this.initialData.set(data);
          this.loadStats(data.id);
        },
        error: (err) => {
          console.error('Load error:', err);
          this.router.navigate(['/']);
        }
      });
    } else {
      this.router.navigate(['/']);
    }
  }

  private loadStats(id: string) {
    this.analyticsService.getStats(id).subscribe({
      next: (count) => this.clickCount.set(count),
      error: (err) => console.error('Stats error:', err)
    });
  }

  onSave(data: Partial<GoLink>) {
    const current = this.initialData();
    if (!current) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Assuming lockUuid is available on current GoLink object
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

    if (confirm('Are you sure you want to delete this GoLink? This action cannot be undone.')) {
      this.isLoading.set(true);
      this.service.delete(current.id).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set('Failed to delete GoLink. Please try again.');
          console.error('Delete error:', err);
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/']);
  }
}
