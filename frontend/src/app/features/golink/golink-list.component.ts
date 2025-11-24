import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoLinkService } from './golink.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './golink-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoLinkListComponent implements OnInit {
  private readonly goLinkService = inject(GoLinkService);

  goLinks = this.goLinkService.goLinks;
  isLoading = this.goLinkService.isLoading;
  error = this.goLinkService.error;

  ngOnInit(): void {
    this.goLinkService.loadAll();
  }
}
