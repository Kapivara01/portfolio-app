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

    // --- Profile ---
    async getProfile(userId: string) {
        return this.supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
    }

    async updateProfile(userId: string, profile: any) {
        const updateHelper = {
            ...profile,
            updated_at: new Date(),
        };
        return this.supabase
            .from('profiles')
            .upsert(updateHelper);
    }

    // --- Portfolio ---
    async getPortfolio() {
        return this.supabase
            .from('portfolio_items')
            .select('*')
            .order('created_at', { ascending: false });
    }

    async createPortfolioItem(item: any) {
        return this.supabase
            .from('portfolio_items')
            .insert(item);
    }

    async deletePortfolioItem(id: string) {
        return this.supabase
            .from('portfolio_items')
            .delete()
            .eq('id', id);
    }

    // --- Storage ---
    async uploadFile(file: File, path: string) {
        return this.supabase.storage
            .from('portfolio-files') // El bucket que acabamos de crear
            .upload(path, file);
    }

    getPublicUrl(path: string) {
        return this.supabase.storage
            .from('portfolio-files')
            .getPublicUrl(path);
    }
}
