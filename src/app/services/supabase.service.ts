import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(environment.supabase.url, environment.supabase.key);
    }

    get client(): SupabaseClient {
        return this.supabase;
    }

    async signIn(email: string) {
        return this.supabase.auth.signInWithOtp({ email });
    }

    async signOut() {
        return this.supabase.auth.signOut();
    }

    async getUser(): Promise<User | null> {
        const { data: { user } } = await this.supabase.auth.getUser();
        return user;
    }
}
