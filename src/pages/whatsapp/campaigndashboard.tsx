import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../dashboard/dashboard.css';
import IconBell from '../../components/Icon/IconBell';
import IconSend from '../../components/Icon/IconSend';
import IconUsers from '../../components/Icon/IconUsers';
import IconMessage from '../../components/Icon/IconMessage';
import IconTrendingUp from '../../components/Icon/IconTrendingUp';
import { getBaseUrl } from '../../components/BaseUrl';
import apiClient from '../../utils/apiClient';
import Toast from '../../services/toast';

const endpoints = {
  dashboard: `${getBaseUrl()}/whatsapp/dashboard-report`,
};

const CampaignDashboard = () => {
  const navigate = useNavigate();
  const toast    = Toast();

  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  const [subscribers, setSubscribers] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(endpoints.dashboard);
        const data = res.data?.data || {};
        setOverview(data.campaign_overview || {});
        setSubscribers(data.subscriber_engagement || {});
        setCampaigns(data.latest_campaigns || []);
      } catch (error) {
        toast.error('Failed to load campaign data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-white border border-slate-200 shadow-sm rounded-xl px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary p-2 text-white shadow ring-2 ring-primary/30">
            <IconBell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">WhatsApp Campaign Dashboard</h2>
            <p className="text-sm text-slate-500">Track messages, performance, and subscribers</p>
          </div>
        </div>
        <button onClick={() => navigate('/pages/whatsapp/run-campaign')} className="btn btn-primary btn-sm">
          <IconSend className="w-3 h-3 mr-2" /> New Campaign
        </button>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-10">Loading dashboard...</div>
      ) : (
        <>
          {/* ========== Latest Campaigns Table Card (full width) ========== */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <IconMessage className="w-5 h-5 text-primary" /> Latest Campaigns
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                    <th className="py-2 text-left">Campaign Name</th>
                    <th className="py-2 text-center">Sent</th>
                    <th className="py-2 text-center">Delivered</th>
                    <th className="py-2 text-center">Read</th>
                    <th className="py-2 text-center">Failed</th>
                    <th className="py-2 text-center">Delivery %</th>
                    <th className="py-2 text-center">Read %</th>
                    <th className="py-2 text-center">Failure %</th>
                    <th className="py-2 text-right">Last Sent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-slate-400">
                        No campaigns found
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((c, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="py-2 font-medium text-slate-800">{c.campaign_name}</td>
                        <td className="py-2 text-center font-medium">{c.sent}</td>
                        <td className="py-2 text-center text-emerald-700 font-medium">
                          {c.delivered}
                        </td>
                        <td className="py-2 text-center text-purple-700 font-medium">{c.read}</td>
                        <td className="py-2 text-center text-red-700 font-medium">{c.failed}</td>
                        <td className="py-2 text-center text-slate-700">{c.delivery_rate}%</td>
                        <td className="py-2 text-center text-slate-700">{c.read_rate}%</td>
                        <td className="py-2 text-center text-slate-700">{c.failure_rate}%</td>
                        <td className="py-2 text-right text-slate-600">
                          {new Date(c.last_sent_at).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 🟩 Two Half-Width Cards in One Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ========== Campaign Overview ========== */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <IconTrendingUp className="w-5 h-5 text-primary" /> Campaign Overview
              </h3>
              {/* 3 cards per row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard label="Total Messages" value={overview?.total_messages ?? 0} color="blue" />
                <StatCard label="Sent" value={overview?.sent ?? 0} color="emerald" />
                <StatCard label="Delivered" value={overview?.delivered ?? 0} color="green" />
                <StatCard label="Read" value={overview?.read ?? 0} color="purple" />
                <StatCard label="Failed" value={overview?.failed ?? 0} color="red" />
                <StatCard
                  label="Avg Read %"
                  value={`${overview?.rates?.read_rate ?? 0}%`}
                  color="amber"
                />
              </div>
            </div>

            {/* ========== Subscriber Engagement ========== */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <IconUsers className="w-5 h-5 text-primary" /> Subscriber Engagement
              </h3>
              {/* 3 cards per row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard
                  label="Total Subscribers"
                  value={subscribers?.counts?.total_subscribers ?? 0}
                  color="blue"
                />
                <StatCard
                  label="Opted-In"
                  value={subscribers?.counts?.whatsapp_opted_in ?? 0}
                  color="emerald"
                />
                <StatCard
                  label="Active Sessions"
                  value={subscribers?.counts?.active_sessions ?? 0}
                  color="purple"
                />
                <StatCard
                  label="Eligible"
                  value={subscribers?.counts?.eligible_for_campaigns ?? 0}
                  color="green"
                />
                <StatCard
                  label="Blocked"
                  value={subscribers?.counts?.blocked_due_to_failures ?? 0}
                  color="red"
                />
                <StatCard
                  label="Opt-In Rate"
                  value={`${subscribers?.rates?.whatsapp_opt_in_rate ?? 0}%`}
                  color="amber"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
const StatCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: 'blue' | 'emerald' | 'green' | 'purple' | 'red' | 'amber';
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="flex items-center p-4 rounded-lg border border-slate-200 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      <div
        className={`w-10 h-10 grid place-items-center rounded-lg ${colorClasses[color]} font-bold`}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="ml-3">
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
};

export default CampaignDashboard;
