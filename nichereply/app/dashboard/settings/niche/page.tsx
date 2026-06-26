import { getCurrentUser } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { NicheSwitcher } from './niche-switcher';
import { FlowPreview } from '@/components/whatsapp/flow-preview';
import { getAvailableNiches } from '@/lib/config/loader';
import { loadNicheConfig } from '@/lib/config/loader';

export default async function NicheConfigPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();
  const { data: business } = await admin
    .from('businesses')
    .select('id, niche')
    .eq('owner_id', user.id)
    .single();

  if (!business) {
    return <Card><CardContent className="py-12 text-center text-[var(--muted-foreground)]">Set up your business first.</CardContent></Card>;
  }

  const availableNiches = getAvailableNiches();
  const currentConfig = loadNicheConfig(business.niche || 'salons');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><h3 className="font-semibold">Switch Niche</h3></CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Changing your niche will update how the bot responds to customers. All conversation history is preserved.
          </p>
          <NicheSwitcher
            businessId={business.id}
            currentNiche={business.niche || 'salons'}
            niches={availableNiches}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Flow Preview: {currentConfig.displayName}</h3>
            <span className="text-xs text-[var(--muted-foreground)]">v{currentConfig.version}</span>
          </div>
        </CardHeader>
        <CardContent>
          <FlowPreview config={currentConfig as any} />
        </CardContent>
      </Card>
    </div>
  );
}
