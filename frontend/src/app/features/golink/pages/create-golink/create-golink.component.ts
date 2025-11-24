import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GoLinkFormComponent } from '../../components/golink-form/golink-form.component';
import { GoLinkService } from '../../services/golink.service';
import { GoLink } from '../../models/golink.model';

@Component({
  selector: 'app-create-golink',
  standalone: true,
  imports: [CommonModule, GoLinkFormComponent],
  template: `
    <div class="container mx-auto px-4 py-8 max-w-2xl">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Create New GoLink</h1>
      <app-golink-form
        [isLoading]="isLoading()"
        [errorMessage]="errorMessage()"
        (save)="onSave($event)"
        (cancel)="onCancel()"
      ></app-golink-form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateGoLinkComponent {
  private readonly router = inject(Router);
  private readonly service = inject(GoLinkService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  onSave(data: Partial<GoLink>) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.service.create(data).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 409) {
          this.errorMessage.set('A GoLink with this name already exists.');
        } else {
          this.errorMessage.set('Failed to create GoLink. Please try again.');
        }
        console.error('Create error:', err);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/']);
  }
}
