import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';
import { GoLink } from '../../../golink/models/golink.model';

@Component({
  selector: 'app-top-links',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Top GoLinks</h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">Most frequently used links.</p>
      </div>
      <div class="border-t border-gray-200">
        @if (isLoading()) {
          <div class="p-4 text-center text-gray-500">Loading...</div>
        } @else if (topLinks().length === 0) {
          <div class="p-4 text-center text-gray-500">No data available yet.</div>
        } @else {
          <ul role="list" class="divide-y divide-gray-200">
            @for (link of topLinks(); track link.id) {
              <li class="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div class="flex items-center justify-between">
                  <div class="text-sm font-medium text-blue-600 truncate">
                    <a [routerLink]="['/edit', link.id]" class="hover:underline">{{ link.name }}</a>
                  </div>
                  <div class="ml-2 flex-shrink-0 flex">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
                <div class="mt-2 sm:flex sm:justify-between">
                  <div class="sm:flex">
                    <p class="flex items-center text-sm text-gray-500 truncate max-w-md">
                      {{ link.targetUrl }}
                    </p>
                  </div>
                </div>
              </li>
            }
          </ul>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopLinksComponent implements OnInit {
  private readonly analyticsService = inject(AnalyticsService);

  readonly topLinks = signal<GoLink[]>([]);
  readonly isLoading = signal(false);

  ngOnInit() {
    this.loadTopLinks();
  }

  private loadTopLinks() {
    this.isLoading.set(true);
    this.analyticsService.getTopLinks(undefined, undefined, 5).subscribe({
      next: (links) => {
        this.topLinks.set(links);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load top links', err);
        this.isLoading.set(false);
      }
    });
  }
}
