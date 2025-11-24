import { Component, ChangeDetectionStrategy, input, output, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { GoLink } from '../../models/golink.model';

@Component({
  selector: 'app-golink-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './golink-form.component.html',
  styleUrls: ['./golink-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoLinkFormComponent {
  private readonly fb = inject(FormBuilder);

  // Inputs
  readonly initialData = input<GoLink | null>(null);
  readonly isLoading = input<boolean>(false);
  readonly errorMessage = input<string | null>(null);
  readonly showDelete = input<boolean>(false);

  // Outputs
  readonly save = output<Partial<GoLink>>();
  readonly cancel = output<void>();
  readonly delete = output<void>();

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.pattern('^[a-z0-9_-]+$')]],
    targetUrl: ['', [Validators.required, Validators.pattern('^https?://.+')]],
    description: [''],
    tags: ['']
  });

  constructor() {
    // Effect to patch form when initialData changes
    effect(() => {
      const data = this.initialData();
      if (data) {
        this.form.patchValue({
          name: data.name,
          targetUrl: data.targetUrl,
          description: data.description,
          tags: data.tags.join(', ')
        });
        // Name is usually immutable in edit, but let's allow viewing it. 
        // If the backend doesn't allow name changes, we might want to disable it.
        // For now, let's keep it enabled or maybe disable if it's edit mode?
        // The plan says "Edit GoLink page... PUT API". Usually ID/Name is the key.
        // If ID is UUID, Name might be changeable. Let's assume it is for now, or read-only if needed.
        // Given the backend `update` method implementation in previous steps:
        // "Name is immutable for now... Let's assume name is immutable"
        // So I should disable the name field in edit mode.
        this.form.controls.name.disable();
      } else {
        this.form.reset();
        this.form.controls.name.enable();
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.getRawValue();
      const tags = formValue.tags 
        ? formValue.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0)
        : [];
      
      this.save.emit({
        name: formValue.name ?? '',
        targetUrl: formValue.targetUrl ?? '',
        description: formValue.description ?? '',
        tags
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  onDelete() {
    if (confirm('Are you sure you want to delete this GoLink? This action cannot be undone.')) {
      this.delete.emit();
    }
  }
}
