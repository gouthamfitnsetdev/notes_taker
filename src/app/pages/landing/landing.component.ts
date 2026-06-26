import { Component, OnInit, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, SlicePipe } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { NoteService } from '../../services/note.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [DatePipe, SlicePipe],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit {
  private router = inject(Router);
  protected auth = inject(AuthService);
  protected noteService = inject(NoteService);

  constructor() {
    effect(() => {
      if (!this.auth.loading() && !this.auth.user()) {
        this.router.navigate(['/login']);
      }
    });
  }

  readonly notes = this.noteService.notes;
  readonly loading = this.noteService.loading;

  get userName(): string {
    const meta = this.auth.user()?.user_metadata;
    return meta?.['full_name']?.split(' ')[0] ?? meta?.['email']?.split('@')[0] ?? 'there';
  }

  get avatarUrl(): string | null {
    return this.auth.user()?.user_metadata?.['avatar_url'] ?? null;
  }

  createNew(): void { this.router.navigate(['/editor']); }
  openNote(id: string): void { this.router.navigate(['/editor', id]); }
  ngOnInit(): void { this.noteService.loadAll(); }

  signOut(): void { this.auth.signOut(); }

  stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent ?? div.innerText ?? '';
  }
}
