# NoteKeeper

A minimal note-taking app where you can write, save, and permanently lock notes. Built with Angular 18 and backed by Supabase — notes sync across devices and stay private to your account.

**Live:** https://notes-taker-snowy.vercel.app

**Demo:** https://youtu.be/GXvAYUNSe6o

---

## What it does

- Sign in with Google — no separate account needed
- Create notes with a rich text editor (bold, italic, lists, headings, links)
- Edit any unlocked note whenever you want
- **Save & Lock** a note to make it permanently read-only — good for things you don't want to accidentally change later
- Download any note as a plain `.txt` file
- All notes are private to your account

---

## Pages

**Login** — Google sign-in, redirects straight to your notes after auth.

**Notes list** — all your notes as cards with last edited date and lock status. Create new ones from here.

**Editor** — WYSIWYG editor for writing. Save, Cancel, Save & Lock. Locked notes open in read-only view.

---

## Stack

| What | Why |
|---|---|
| **Angular 18** | Standalone components, new `@if`/`@for` template syntax throughout |
| **Angular Signals** | State management with `signal()`, `computed()`, `effect()` — cleaner than RxJS subjects at this scale |
| **Angular Material** | Confirmation dialog for locking, snackbar feedback on save |
| **ngx-quill / Quill.js** | WYSIWYG rich text editor |
| **Supabase** | Google OAuth + Postgres. RLS policies ensure each user only sees their own notes |
| **Reactive Forms** | Title input with validation in the editor |
| **Vercel** | Hosting, auto-deploys on every push to main |

---

## Running locally

```bash
git clone https://github.com/gouthamfitnsetdev/notes_taker.git
cd notes_taker
npm install --legacy-peer-deps
ng serve --port 4300
```

Open `http://localhost:4300`
