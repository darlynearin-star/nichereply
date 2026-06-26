import { getCurrentUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SetupWizard } from '@/components/wizard/setup-wizard';

export default async function WizardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return <SetupWizard userId={user.id} />;
}
