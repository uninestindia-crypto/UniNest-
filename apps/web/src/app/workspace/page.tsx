
import type { Metadata } from 'next';
import WorkspaceClient from '@/components/workspace/workspace-client';


export const metadata: Metadata = {
  title: 'Workspace | UniNest',
  description: 'Unlock your potential with competitions and internships on UniNest.',
};

export default function WorkspacePage() {
    return <WorkspaceClient />;
}
