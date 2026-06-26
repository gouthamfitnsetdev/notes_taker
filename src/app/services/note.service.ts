import { Injectable, effect, inject, signal } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { SupabaseService } from '../core/supabase.service';
import { Note } from '../models/note.model';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private sb = inject(SupabaseService);
  private auth = inject(AuthService);

  private _notes = signal<Note[]>([]);
  private _loading = signal(false);

  readonly notes = this._notes.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor() {
    effect(() => {
      if (this.auth.user()) {
        this.loadAll();
      } else {
        this._notes.set([]);
      }
    });
  }

  async loadAll(): Promise<void> {
    this._loading.set(true);
    const { data } = await this.sb.client
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    this._notes.set(data ?? []);
    this._loading.set(false);
  }

  getById(id: string): Note | undefined {
    return this._notes().find(n => n.id === id);
  }

  async fetchById(id: string): Promise<Note | null> {
    const { data } = await this.sb.client.from('notes').select('*').eq('id', id).single();
    return data;
  }

  async create(title: string, content: string, locked = false): Promise<string> {
    const { data, error } = await this.sb.client
      .from('notes')
      .insert({
        title: title.trim() || 'Untitled',
        content,
        is_locked: locked,
        user_id: this.auth.user()!.id,
      })
      .select()
      .single();
    if (error) throw error;
    this._notes.update(notes => [data, ...notes]);
    return data.id;
  }

  async update(id: string, title: string, content: string): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await this.sb.client
      .from('notes')
      .update({ title: title.trim() || 'Untitled', content, updated_at: now })
      .eq('id', id);
    if (error) throw error;
    this._notes.update(notes =>
      notes.map(n =>
        n.id === id ? { ...n, title: title.trim() || 'Untitled', content, updated_at: now } : n,
      ),
    );
  }

  async lock(id: string, title: string, content: string): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await this.sb.client
      .from('notes')
      .update({ title: title.trim() || 'Untitled', content, is_locked: true, updated_at: now })
      .eq('id', id);
    if (error) throw error;
    this._notes.update(notes =>
      notes.map(n =>
        n.id === id
          ? { ...n, title: title.trim() || 'Untitled', content, is_locked: true, updated_at: now }
          : n,
      ),
    );
  }
}
