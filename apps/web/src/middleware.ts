import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * SECURITY MIDDLEWARE
 * 
 * This middleware provides server-side route protection for:
 * 1. Admin routes - requires authenticated admin user
 * 2. Protected API routes - requires authentication
 * 
 * Routes can be accessed without protection through the PUBLIC_ROUTES array.
 */

// Routes that can be accessed without authentication
const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/signup',
    '/password-reset',
    '/about',
    '/terms',
    '/hostels',
    '/donate',
    '/feed',
    '/search',
    '/marketplace',
    '/social',
    '/download',
];

// Routes that require admin role
const ADMIN_ROUTES_PREFIX = '/admin';

// Admin setup is special - it requires secret but not existing auth
const ADMIN_SETUP_ROUTE = '/admin/setup';

// API routes that should be protected
const PROTECTED_API_ROUTES = [
    '/api/create-order',
    '/api/notifications/send',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Create response to pass through
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // Create Supabase client with cookie handling
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    // Try to get the current session
    const { data: { user } } = await supabase.auth.getUser();

    // ADMIN SETUP ROUTE - Allow access (protected by secret on backend)
    if (pathname === ADMIN_SETUP_ROUTE) {
        return response;
    }

    // ADMIN ROUTES - Require admin role
    if (pathname.startsWith(ADMIN_ROUTES_PREFIX)) {
        if (!user) {
            // Not logged in - redirect to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Check if user is admin
        // First try user metadata (from JWT)
        const userRole = user.user_metadata?.role;

        if (userRole !== 'admin') {
            // Not an admin - redirect to home with message
            const homeUrl = new URL('/', request.url);
            homeUrl.searchParams.set('error', 'unauthorized');
            return NextResponse.redirect(homeUrl);
        }

        // User is admin - allow access
        return response;
    }

    // PROTECTED API ROUTES - Require authentication
    for (const apiRoute of PROTECTED_API_ROUTES) {
        if (pathname === apiRoute) {
            if (!user) {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                );
            }
        }
    }

    // All other routes - allow access
    return response;
}

// Configure which routes the middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
