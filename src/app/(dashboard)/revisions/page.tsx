import { redirect } from 'next/navigation';

export default function RevisionsRedirectPage() {
  redirect('/practice?tab=revisions');
}
