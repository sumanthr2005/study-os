import { redirect } from 'next/navigation';

export default function RevisionRedirectPage() {
  redirect('/practice?tab=revisions');
}
