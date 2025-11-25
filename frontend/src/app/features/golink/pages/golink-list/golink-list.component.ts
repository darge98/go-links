import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GoLinkService } from '../../services/golink.service';
import { TopLinksComponent } from '../../../analytics/components/top-links/top-links.component';

@Component({
  selector: 'app-golink-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TopLinksComponent],
  templateUrl: './golink-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoLinkListComponent implements OnInit {
  private readonly service = inject(GoLinkService);
  readonly goLinks = this.service.goLinks;

  ngOnInit() {
    this.service.loadAll();
  }
}
