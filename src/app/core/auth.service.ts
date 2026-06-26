import { Injectable, inject, signal } from '@angular/core';
import type { User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sb = inject(SupabaseService);

  readonly user = signal<User | null>(null);
  readonly loading = signal(true);

  constructor() {
    this.sb.client.auth.onAuthStateChange((event, session) => {
      this.user.set(session?.user ?? null);
      if (event === 'INITIAL_SESSION') this.loading.set(false);
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    });
  }

  signInWithGoogle(): Promise<void> {
    return this.sb.client.auth
      .signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      })
      .then(() => {});
  }

  signOut(): Promise<void> {
    return this.sb.client.auth.signOut().then(() => {});
  }
}
