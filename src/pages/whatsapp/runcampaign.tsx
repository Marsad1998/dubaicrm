import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import '../dashboard/dashboard.css';
import { getBaseUrl } from '../../components/BaseUrl';
import apiClient from '../../utils/apiClient';
import Toast from '../../services/toast';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import IconBell from '../../components/Icon/IconBell';
import Swal from 'sweetalert2';
import { SUBSCRIBER_TYPES, SubscriberType } from '../../services/subscriberTypes';

type WTemplate = {
  id: number;
  friendly_name: string;
  sid: string;
  category?: string;
  language?: string;
  sample_text?: string;
};

type TemplatePreview =
  | string
  | {
      body?: string;
      media?: string;
      footer?: string;
      button?: { text: string; url: string; type?: string }[];
    };

const endpoints = {
  templates: `${getBaseUrl()}/whatsapp/show`,
  runCampaign: `${getBaseUrl()}/whatsapp/campaign/run`,
  templatePreview: (sid: string) => `${getBaseUrl()}/whatsapp/templates/${sid}/preview`,
};

const RunCampaign = () => {
  const navigate = useNavigate();
  const toast = Toast();

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [templates, setTemplates] = useState<WTemplate[]>([]);
  const [templateId, setTemplateId] = useState<number | ''>('');
  const [subscriberTypes, setSubscriberTypes] = useState<SubscriberType[]>([]);
  const [sendType, setSendType] = useState<'now' | 'schedule'>('now');
  const [scheduleAt, setScheduleAt] = useState<Date | null>(null);
  const [preview, setPreview] = useState<TemplatePreview>('');
  const [previewLoading, setPreviewLoading] = useState(false);

  const selectedTemplate = templates.find((t) => t.id === templateId);

  // Load templates
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const tRes = await apiClient.get(endpoints.templates, { params: { page: 1, per_page: 100 } });
        setTemplates(Array.isArray(tRes.data?.data) ? tRes.data.data : []);
      } catch {
        toast.error('Failed to load campaign data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load template preview
 useEffect(() => {
  (async () => {
    if (!selectedTemplate?.sid) {
      setPreview('');
      return;
    }
    try {
      setPreviewLoading(true); // 👈 start loading
      const p = await apiClient.get(endpoints.templatePreview(selectedTemplate.sid));
      setPreview(p.data?.preview || selectedTemplate.sample_text || '');
    } catch {
      setPreview(selectedTemplate?.sample_text || '');
    } finally {
      setPreviewLoading(false); // 👈 stop loading
    }
  })();
}, [templateId]);

  const validate = () => {
    if (!templateId) {
      toast.error('Please select a WhatsApp template');
      return false;
    }
    if (!subscriberTypes.length) {
      toast.error('Please select at least one subscriber type');
      return false;
    }
    if (sendType === 'schedule' && !scheduleAt) {
      toast.error('Please pick a schedule date & time');
      return false;
    }
    return true;
  };

  const onRun = async () => {
    if (!validate()) return;
    const selectedLabels = subscriberTypes.map((t) => t.label).join(', ');
    const confirm = await Swal.fire({
      title: sendType === 'now' ? 'Send campaign now?' : 'Schedule this campaign?',
      text: selectedLabels ? `Target: ${selectedLabels}. Continue?` : 'Do you want to proceed?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: sendType === 'now' ? 'Send Now' : 'Schedule',
    });
    
    if (!confirm.isConfirmed) return;

    try {
      setSending(true);
      const payload = {
        template_id: templateId,
        subscriber_types: subscriberTypes.map((t) => t.value),
        send_type: sendType,
        schedule_at: sendType === 'schedule' && scheduleAt ? scheduleAt.toISOString() : null,
      };
      const res = await apiClient.post(endpoints.runCampaign, payload);
      if (res.status === 200) {
        toast.success(sendType === 'now' ? 'Campaign started' : 'Campaign scheduled');
        navigate('/pages/whatsapp/campaign-dashboard');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to run campaign');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border border-slate-200 shadow-sm rounded-xl px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary p-2 text-white shadow ring-2 ring-primary/30">
            <IconBell />
          </div>
          <h2 className="text-lg font-semibold text-slate-700">Run WhatsApp Campaign</h2>
        </div>
        <span className="text-xs text-slate-500">{loading ? 'Loading resources…' : 'Ready'}</span>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Side */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* WhatsApp Template */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">WhatsApp Template</label>
                <Select
                  isDisabled={loading || sending}
                  value={
                    templates.find((t) => t.id === templateId)
                      ? {
                          value: templateId,
                          label: templates.find((t) => t.id === templateId)!.friendly_name,
                        }
                      : null
                  }
                  onChange={(option: any) => setTemplateId(option?.value || '')}
                  options={templates.map((t) => ({
                    value: t.id,
                    label: `${t.friendly_name} ${t.language ? `(${t.language})` : ''}`,
                  }))}
                  placeholder="Select a template…"
                />
                {selectedTemplate?.category && (
                  <p className="mt-1 text-xs text-slate-400">Category: {selectedTemplate.category}</p>
                )}
              </div>
              {/* Subscriber Type */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Subscriber Type</label>
                <Select
                  isDisabled={sending}
                  isMulti
                  value={subscriberTypes}
                  onChange={(options: any) => setSubscriberTypes(options || [])}
                  options={SUBSCRIBER_TYPES}
                  placeholder="Select one or more types…"
                />
              </div>
            </div>

            {/* Send Type & Schedule */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Send Type</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sendType"
                      className="form-radio text-primary"
                      checked={sendType === 'now'}
                      onChange={() => setSendType('now')}
                      disabled={sending}
                    />
                    <span className="text-sm text-slate-600">Send now</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sendType"
                      className="form-radio text-primary"
                      checked={sendType === 'schedule'}
                      onChange={() => setSendType('schedule')}
                      disabled={sending}
                    />
                    <span className="text-sm text-slate-600">Schedule</span>
                  </label>
                </div>
              </div>
              <div className={sendType === 'schedule' ? '' : 'opacity-60'}>
                <label className="block text-sm font-medium text-slate-600 mb-2">Schedule at</label>
                <Flatpickr
                  options={{ enableTime: true, dateFormat: 'Y-m-d H:i' }}
                  value={scheduleAt as any}
                  onChange={(dates) => setScheduleAt(dates?.[0] || null)}
                  disabled={sendType !== 'schedule' || sending}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="mt-1 text-xs text-slate-400">UAE time is used unless backend localizes scheduling.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">Ensure your template has approved variables & mappings.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="btn btn-outline-secondary btn-sm"
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  onClick={onRun}
                  className={`btn btn-sm btn-primary ${sending ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={sending}
                >
                  {sending
                    ? 'Processing…'
                    : sendType === 'now'
                    ? 'Run Campaign'
                    : 'Schedule Campaign'}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="xl:col-span-1">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-semibold text-slate-700">Template Preview</h3>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 min-h-[120px]">
                {previewLoading ? ( 
                    <p className="text-sm text-slate-500">Loading preview…</p>
                ) : selectedTemplate ? (
                    <div className="space-y-3">
                    <div>
                        <div className="text-xs text-slate-400">Name</div>
                        <div className="font-medium">{selectedTemplate.friendly_name}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400">Message</div>
                        <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-6"> 
                            {typeof preview === 'string' ? preview : preview?.body || 'No preview available.'} 
                        </pre>
                        {typeof preview !== 'string' && preview?.media && (
                            <img src={preview.media} alt="media" className="rounded-lg mt-3" />
                        )}
                        {typeof preview !== 'string' && preview?.footer && (
                        <div className="text-xs text-slate-500 mt-2">{preview.footer}</div>
                        )}
                        {typeof preview !== 'string' && preview?.button?.map((btn, i) => (
                            <a key={i} href={btn.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-primary underline mr-4"> {btn.text} </a>
                        ))}
                    </div>
                    </div>
                ) : (
                    <p className="text-sm text-slate-500">Select a template to see its preview.</p>
                )}
                </div>
            <h3 className="text-sm font-semibold text-slate-700">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Template" value={selectedTemplate ? 1 : 0} />
              <StatCard label="Mode" value={sendType === 'now' ? 'Now' : 'Scheduled'} />
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 text-xs">
              💡 Tip: Large audiences? Use scheduling or backend batching to stay within throughput limits.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: number | string }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="text-xl font-semibold mt-1">{value}</div>
  </div>
);

export default RunCampaign;
