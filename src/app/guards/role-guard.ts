import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Supabase } from '../servicios/supabase';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private supabase: Supabase, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const allowedRoles = route.data['roles'] as string[];

    const session = await this.supabase.supabase.auth.getUser();
    const email = session.data.user?.email;

    const { data: user, error } = await this.supabase.supabase
      .from('usuarios')
      .select('rol')
      .eq('mail', email)
      .single();

    if (user && allowedRoles.includes(user.rol)) {
      return true;
    }

    await Swal.fire({
      icon: 'error',
      title: 'Acceso denegado',
      text: 'No tenés permiso para acceder a esta sección.',
      confirmButtonColor: '#1d4ed8'
    });

    this.router.navigate(['/bienvenida']);
    return false;
  }
}
