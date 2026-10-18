import { redirect } from 'next/navigation';

export default function LeetCodeRedirectPage() {
  redirect('/practice?tab=leetcode');
}
