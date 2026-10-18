import { redirect } from 'next/navigation';

export default function WellnessPage() {
  // Wellness has been consolidated into Tasks/Habits to reduce navigation clutter.
  redirect('/tasks');
}
