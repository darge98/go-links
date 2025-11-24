import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GoLinkService } from '../../services/golink.service';

@Component({
  selector: 'app-golink-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
