import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../dashboard/dashboard.css';
import { getBaseUrl } from '../../components/BaseUrl';
import apiClient from '../../utils/apiClient';
import Toast from '../../services/toast';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import IconBell from '../../components/Icon/IconBell';
import Swal from 'sweetalert2';

type WTemplate = {
  id: number;
  friendly_name: string;
  sid: string;
  category?: string;
  language?: string;
  sample_text?: string; // optional if you return a preview text
};

type SubList = {
  id: number;
  name: string;
  total_subscribers: number;
  description?: string;
};

const endpoints = {
  templates: `${getBaseUrl()}/whatsapp/show`,           // GET ?page=1&per_page=100
  subscriberLists: `${getBaseUrl()}/subscribers/lists`, // GET
  runCampaign: `${getBaseUrl()}/whatsapp/campaign/run`, // POST
  templatePreview: (sid: string) => `${getBaseUrl()}/whatsapp/templates/${sid}/preview`, // GET (optional)
};

const RunCampaign = () => {
  const navigate = useNavigate();
  const toast = Toast();

  // UI state
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Data
  const [templates, setTemplates] = useState<WTemplate[]>([]);
  const [lists, setLists] = useState<SubList[]>([]);

  // Selections
  const [templateId, setTemplateId] = useState<number | ''>('');
  const [listId, setListId] = useState<number | ''>('');
  const [sendType, setSendType] = useState<'now' | 'schedule'>('now');
  const [scheduleAt, setScheduleAt] = useState<Date | null>(null);

  // Optional: live preview
  const [preview, setPreview] = useState<string>('');

  // Derived
  const selectedTemplate = templates.find(t => t.id === templateId);
  const selectedList = lists.find(l => l.id === listId);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // fetch templates (get all at once; increase per_page if needed)
        const tRes = await apiClient.get(endpoints.templates, { params: { page: 1, per_page: 100 } });
        setTemplates(Array.isArray(tRes.data?.data) ? tRes.data.data : []);

        // fetch subscriber lists
        const lRes = await apiClient.get(endpoints.subscriberLists);
        setLists(Array.isArray(lRes.data) ? lRes.data : (lRes.data?.data || []));

      } catch (e: any) {
        toast.error('Failed to load campaign data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Pull preview text when template changes (if you have an API)
  useEffect(() => {
    (async () => {
      if (!selectedTemplate?.sid) { setPreview(''); return; }
      try {
        const p = await apiClient.get(endpoints.templatePreview(selectedTemplate.sid));
        setPreview(p.data?.preview || selectedTemplate.sample_text || '');
      } catch {
        setPreview(selectedTemplate?.sample_text || '');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  const validate = () => {
    if (!templateId) { toast.error('Please select a WhatsApp template'); return false; }
    if (!listId) { toast.error('Please select a subscriber list'); return false; }
    if (sendType === 'schedule' && !scheduleAt) { toast.error('Please pick a schedule date & time'); return false; }
    return true;
  };

  const onRun = async () => {
    if (!validate()) return;

    const confirm = await Swal.fire({
      title: sendType === 'now' ? 'Send campaign now?' : 'Schedule this campaign?',
      text: selectedList?.total_subscribers
        ? `Recipients: ${selectedList.total_subscribers}. Continue?`
        : 'Do you want to proceed?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: sendType === 'now' ? 'Send Now' : 'Schedule',
    });

    if (!confirm.isConfirmed) return;

    try {
      setSending(true);
      const payload = {
        template_id: templateId,
        list_id: listId,
        send_type: sendType,                         // 'now' | 'schedule'
        schedule_at: sendType === 'schedule' && scheduleAt ? scheduleAt.toISOString() : null,
      };
      const res = await apiClient.post(endpoints.runCampaign, payload);
      if (res.status === 200) {
        toast.success(sendType === 'now' ? 'Campaign started' : 'Campaign scheduled');
        navigate('/whatsapp/campaigns'); // adjust route if needed
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to run campaign');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="panel flex items-center justify-between overflow-visible whitespace-nowrap p-3 text-dark relative">
        <div className="flex items-center">
          <div className="rounded-full bg-primary p-1.5 text-white ring-2 ring-primary/30 mr-3">
            <IconBell />
          </div>
          <span className="mr-3 font-medium">Run WhatsApp Campaign</span>
        </div>
        <div className="text-xs text-slate-500">
          {loading ? 'Loading campaign resources…' : 'Ready'}
        </div>
      </div>

      {/* Form + Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: form */}
        <div className="xl:col-span-2">
          <div className="panel p-5 space-y-5">
            {/* Template */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">WhatsApp Template</label>
                <select
                  value={templateId || ''}
                  onChange={(e) => setTemplateId(e.target.value ? Number(e.target.value) : '')}
                  disabled={loading || sending}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="" disabled>Select a template…</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.friendly_name} {t.language ? `(${t.language})` : ''}
                    </option>
                  ))}
                </select>
                {selectedTemplate?.category && (
                  <p className="mt-1 text-xs text-slate-500">Category: {selectedTemplate.category}</p>
                )}
              </div>

              {/* Subscriber list */}
              <div>
                <label className="block text-sm font-medium mb-2">Subscriber List</label>
                <select
                  value={listId || ''}
                  onChange={(e) => setListId(e.target.value ? Number(e.target.value) : '')}
                  disabled={loading || sending}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="" disabled>Select a list…</option>
                  {lists.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} {typeof l.total_subscribers === 'number' ? `(${l.total_subscribers})` : ''}
                    </option>
                  ))}
                </select>
                {selectedList?.description && (
                  <p className="mt-1 text-xs text-slate-500">{selectedList.description}</p>
                )}
              </div>
            </div>

            {/* Send type */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Send Type</label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="sendType"
                      className="form-radio"
                      checked={sendType === 'now'}
                      onChange={() => setSendType('now')}
                      disabled={sending}
                    />
                    <span>Send now</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="sendType"
                      className="form-radio"
                      checked={sendType === 'schedule'}
                      onChange={() => setSendType('schedule')}
                      disabled={sending}
                    />
                    <span>Schedule</span>
                  </label>
                </div>
              </div>

              {/* Scheduler */}
              <div className={sendType === 'schedule' ? 'opacity-100' : 'opacity-60'}>
                <label className="block text-sm font-medium mb-2">Schedule at</label>
                <Flatpickr
                  options={{ enableTime: true, dateFormat: 'Y-m-d H:i' }}
                  value={scheduleAt as any}
                  onChange={dates => setScheduleAt(dates?.[0] || null)}
                  disabled={sendType !== 'schedule' || sending}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="mt-1 text-xs text-slate-500">
                  UAE time is used unless your backend localizes scheduling.
                </p>
              </div>
            </div>

            {/* Action bar */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-500">
                Make sure your template has approved variables & mappings.
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="btn btn-outline-secondary"
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  onClick={onRun}
                  className={`btn btn-primary ${sending ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={sending}
                >
                  {sending ? 'Processing…' : (sendType === 'now' ? 'Run Campaign' : 'Schedule Campaign')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: preview + stats */}
        <div className="xl:col-span-1">
          <div className="panel p-5 space-y-5">
            <h3 className="text-sm font-semibold">Template Preview</h3>
            <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
              {selectedTemplate ? (
                <div className="space-y-2">
                  <div className="text-xs text-slate-500">Name</div>
                  <div className="font-medium">{selectedTemplate.friendly_name}</div>

                  <div className="text-xs text-slate-500 mt-3">Message</div>
                  <pre className="text-sm whitespace-pre-wrap leading-6">{preview || 'No preview available.'}</pre>
                </div>
              ) : (
                <div className="text-sm text-slate-500">Select a template to see its preview.</div>
              )}
            </div>

            <h3 className="text-sm font-semibold">Quick Stats</h3>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Recipients" value={selectedList?.total_subscribers ?? 0} />
              <StatCard label="Template" value={selectedTemplate ? 1 : 0} />
              <StatCard label="Mode" value={sendType === 'now' ? 'Now' : 'Scheduled'} />
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 text-xs">
              Tip: Large lists? Use scheduling or backend batching to stay within throughput limits.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: number | string }) => (
  <div className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="text-xl font-semibold mt-1">{value}</div>
  </div>
);

export default RunCampaign;
