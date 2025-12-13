
import type { Metadata } from 'next';
import { Suspense } from 'react';
import SearchResults from '@/components/search/search-results';

export const metadata: Metadata = {
  title: 'Search Results | UniNest',
  description: 'Find what you are looking for on UniNest.',
};

function SearchPage() {
    return (
        <Suspense fallback={<div>Loading search results...</div>}>
            <SearchResults />
        </Suspense>
    )
}


export default SearchPage;

    