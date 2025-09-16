import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  loading = false;
  error: string | null = null;
  passwordVisible = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false]
  });

  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }

  togglePassword() { this.passwordVisible = !this.passwordVisible; }

  async submit() {
    this.error = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { email, password, remember } = this.form.value as { email: string; password: string; remember: boolean };
    try {
      await this.auth.login(email, password, remember);
      // En una app real navegaríamos al dashboard/home; aquí emitimos un evento simple
      // o se podría inyectar Router. Mantengo minimal para no tocar otras rutas.
      // TODO: inyectar Router y navegar a '/dashboard' si así se desea.
    } catch (e: any) {
      this.error = e?.message ?? 'No fue posible iniciar sesión. Inténtalo otra vez.';
    } finally {
      this.loading = false;
    }
  }
}
