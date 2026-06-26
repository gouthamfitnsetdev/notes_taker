import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, SlicePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth.service';
import { NoteService } from '../../services/note.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    DatePipe,
    SlicePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  private router = inject(Router);
  protected auth = inject(AuthService);
  protected noteService = inject(NoteService);

  readonly notes = this.noteService.notes;
  readonly loading = this.noteService.loading;

  get userName(): string {
    const meta = this.auth.user()?.user_metadata;
    return meta?.['full_name']?.split(' ')[0] ?? meta?.['email']?.split('@')[0] ?? 'there';
  }

  get avatarUrl(): string | null {
    return this.auth.user()?.user_metadata?.['avatar_url'] ?? null;
  }

  createNew(): void {
    this.router.navigate(['/editor']);
  }

  openNote(id: string): void {
    this.router.navigate(['/editor', id]);
  }

  signOut(): void {
    this.auth.signOut();
  }

  stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent ?? div.innerText ?? '';
  }
}
