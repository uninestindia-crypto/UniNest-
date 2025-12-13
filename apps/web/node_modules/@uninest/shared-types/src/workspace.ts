export type Competition = {
    id: number;
    title: string;
    description: string;
    prize: number;
    deadline: string;
    entry_fee: number;
    created_at?: string;
    image_url?: string;
    organizer?: string;
    rules?: string;
};

export type Internship = {
    id: number;
    role: string;
    company: string;
    stipend: number;
    stipend_period: string; // e.g., 'monthly', 'total'
    deadline: string;
    location: string;
    description?: string;
    image_url?: string | null;
    created_at?: string;
    requirements?: string[];
    apply_link?: string;
};

export type WorkspaceCategory = 'competitions' | 'internships';
