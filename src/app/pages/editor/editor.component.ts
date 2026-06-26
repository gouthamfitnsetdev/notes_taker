import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { QuillModule } from 'ngx-quill';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { Note } from '../../models/note.model';
import { NoteService } from '../../services/note.service';

type EditorMode = 'new' | 'edit' | 'view';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatSnackBarModule,
    QuillModule,
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private noteService = inject(NoteService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  mode = signal<EditorMode>('new');
  note = signal<Note | null>(null);
  saving = signal(false);
  initializing = signal(false);

  readonly isReadOnly = computed(() => this.mode() === 'view');
  readonly isNew = computed(() => this.mode() === 'new');

  form!: FormGroup;

  readonly quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, 3, false] }],
      ['link'],
      ['clean'],
    ],
  };

  readonly readOnlyModules = { toolbar: false };

  async ngOnInit(): Promise<void> {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: [''],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.mode.set('new');
      return;
    }

    this.initializing.set(true);
    let note: Note | null | undefined = this.noteService.getById(id);
    if (!note) note = await this.noteService.fetchById(id);

    if (!note) {
      this.router.navigate(['/']);
      return;
    }

    this.note.set(note);
    this.form.patchValue({ title: note.title, content: note.content });
    this.mode.set(note.is_locked ? 'view' : 'edit');
    if (note.is_locked) this.form.disable();
    this.initializing.set(false);
  }

  async save(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    try {
      const { title, content } = this.form.getRawValue();
      if (this.isNew()) {
        await this.noteService.create(title, content ?? '');
      } else {
        await this.noteService.update(this.note()!.id, title, content ?? '');
      }
      this.snackBar.open('Note saved!', '', { duration: 2000 });
      this.router.navigate(['/']);
    } catch {
      this.snackBar.open('Failed to save. Please try again.', '', { duration: 3000 });
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.router.navigate(['/']);
  }

  saveAndLock(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.dialog
      .open(ConfirmDialogComponent, {
        width: '380px',
        data: {
          title: 'Lock this note?',
          message: 'Once locked, this note cannot be edited again. This action is permanent.',
          confirmLabel: 'Lock it',
          confirmColor: 'warn',
        },
      })
      .afterClosed()
      .subscribe(async (confirmed: boolean) => {
        if (!confirmed) return;
        this.saving.set(true);
        try {
          const { title, content } = this.form.getRawValue();
          if (this.isNew()) {
            await this.noteService.create(title, content ?? '', true);
          } else {
            await this.noteService.lock(this.note()!.id, title, content ?? '');
          }
          this.snackBar.open('Note saved and locked permanently.', '', { duration: 3000 });
          this.router.navigate(['/']);
        } catch {
          this.snackBar.open('Failed to lock. Please try again.', '', { duration: 3000 });
        } finally {
          this.saving.set(false);
        }
      });
  }

  downloadNote(): void {
    const { title, content } = this.form.getRawValue();
    const safeTitle = (title || 'note').replace(/[^a-z0-9\-_ ]/gi, '').trim();
    const div = document.createElement('div');
    div.innerHTML = content ?? '';
    const plainText = `${safeTitle}\n${'='.repeat(safeTitle.length)}\n\n${div.innerText ?? div.textContent ?? ''}`;
    const blob = new Blob([plainText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeTitle}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  get modeLabel(): string {
    switch (this.mode()) {
      case 'new':  return 'New Note';
      case 'edit': return 'Edit Note';
      case 'view': return 'Viewing Note (Locked)';
    }
  }
}
