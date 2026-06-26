import { getCurrentUser } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SettingsForm } from './settings-form';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const admin = createAdminClient();
  const { data: business } = await admin
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader><h3 className="font-semibold">Business Profile</h3></CardHeader>
        <CardContent>
          <SettingsForm business={business as any} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold">WhatsApp Integration</h3></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Phone Number ID</p>
                <p className="text-sm text-[var(--muted-foreground)]">{business?.phone_number_id || 'Not configured'}</p>
              </div>
              <Badge color={business?.phone_number_id ? 'green' : 'red'}>{business?.phone_number_id ? 'Connected' : 'Disconnected'}</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">WABA ID</p>
                <p className="text-sm text-[var(--muted-foreground)]">{business?.waba_id || 'Not configured'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold">Current Niche</h3></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{business?.niche || 'Not set'}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Switch your niche in the Niche Config page.</p>
            </div>
            <a href="/dashboard/settings/niche" className="text-sm text-[var(--primary)] font-medium hover:underline">Manage</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
