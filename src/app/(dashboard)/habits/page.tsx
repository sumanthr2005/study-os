import { redirect } from 'next/navigation';

export default function HabitsRedirectPage() {
  redirect('/tasks?tab=habits');
}
