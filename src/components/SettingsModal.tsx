import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { AppSettings } from '@/hooks/useSettings';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
}

export function SettingsModal({ settings, onSave }: SettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AppSettings>(settings);

  function handleOpen(next: boolean) {
    if (next) setDraft(settings);
    setOpen(next);
  }

  function handleSave() {
    onSave(draft);
    setOpen(false);
  }

  function field(key: keyof AppSettings) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setDraft((prev) => ({ ...prev, [key]: e.target.value }));
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="resend-key">Resend API key</Label>
            <Input
              id="resend-key"
              type="password"
              placeholder="re_xxxxxxxxxxxxxxxx"
              value={draft.resendApiKey}
              onChange={field('resendApiKey')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="linear-email">Linear intake email</Label>
            <Input
              id="linear-email"
              type="email"
              placeholder="team@linear.app"
              value={draft.linearIntakeEmail}
              onChange={field('linearIntakeEmail')}
            />
            <p className="text-xs text-muted-foreground">
              Linear → Settings → Teams → [Team] → Integrations → Email
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="resend-from">From address</Label>
            <Input
              id="resend-from"
              type="email"
              placeholder="reviews@yourdomain.com"
              value={draft.resendFrom}
              onChange={field('resendFrom')}
            />
            <p className="text-xs text-muted-foreground">Must be on a verified Resend domain.</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
