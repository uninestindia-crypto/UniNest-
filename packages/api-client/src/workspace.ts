import type { SupabaseClient } from '@supabase/supabase-js';
import type { Competition, Internship } from '@uninest/shared-types';

export function createWorkspaceApi(supabase: SupabaseClient) {
    return {
        async getCompetitions(limit = 10): Promise<Competition[]> {
            const { data, error } = await supabase
                .from('competitions')
                .select('*')
                .order('deadline', { ascending: true })
                .limit(limit);

            if (error) throw error;
            return data as Competition[];
        },

        async getInternships(limit = 10): Promise<Internship[]> {
            const { data, error } = await supabase
                .from('internships')
                .select('*')
                .order('deadline', { ascending: true })
                .limit(limit);

            if (error) throw error;
            return data as Internship[];
        },

        async getCompetitionById(id: number): Promise<Competition | null> {
            const { data, error } = await supabase
                .from('competitions')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as Competition;
        },

        async getInternshipById(id: number): Promise<Internship | null> {
            const { data, error } = await supabase
                .from('internships')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as Internship;
        }
    };
}
