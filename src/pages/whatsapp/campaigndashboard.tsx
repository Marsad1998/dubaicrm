import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../dashboard/dashboard.css';
import IconBell from '../../components/Icon/IconBell';
import IconSend from '../../components/Icon/IconSend';
import IconUsers from '../../components/Icon/IconUsers';
import IconMessage from '../../components/Icon/IconMessage';
import IconThumbUp from '../../components/Icon/IconThumbUp';
import { getBaseUrl } from '../../components/BaseUrl';
import apiClient from '../../utils/apiClient';
import Toast from '../../services/toast';


 const endpoints = {
    templates: `${getBaseUrl()}/whatsapp/dashboard-report`,
  };

const CampaignDashboard = () => {
  const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const [response, setResponse] = useState([]);
   const toast = Toast();
   
    useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const tRes = await apiClient.get(endpoints.templates);
        console.log(tRes);
        setResponse(Array.isArray(tRes.data?.data) ? tRes.data.data : []);
      } catch (error) {
        toast.error('Failed to load campaign data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  

  // Static data for dashboard
  const dashboardStats = {
    phoneNumber: "+971 58 519 3906",
    displayName: "EverNest Real Estate",
    messagingLimit: "100k/24hr",
    apiStatus: "ONBOARDED",
    qualityRating: "Low",
    phoneStatus: "FLAGGED",
    
    messageStats: {
      marketing: { count: "2,801", cost: "$144.97" },
      authentication: { count: "0", cost: "$0.00" },
      service: { count: "5", cost: "$0.00" },
      utility: { count: "0", cost: "$0.00" },
      total: { count: "2,806", cost: "$144.97" }
    },
    
    deliveryStats: {
      sent: "2,999",
      delivered: "2,806",
      read: "1,024",
      failed: "193"
    },
    
    planUsage: {
      templates: { used: 155, total: 250 },
      contacts: { used: 12701, total: 25000 },
      messages: { used: 5141, total: 125000 },
      bulkBroadcasts: { used: 465, total: "∞" },
      transactional: { used: 5, total: 15 },
      apiRequests: { used: 0, total: 25000 }
    },
    
    recentCampaigns: [
      {
        id: 1,
        date: "14 Oct, 19:28",
        name: "Lumena Alta 1",
        status: "COMPLETED",
        total: 4945,
        sent: 2545,
        delivered: 2397,
        read: 1024,
        failed: 2399
      },
      {
        id: 2,
        date: "7 Oct, 18:34",
        name: "Madrid Roadshow Oct 2025",
        status: "COMPLETED",
        total: 404,
        sent: 336,
        delivered: 305,
        read: 144,
        failed: 68
      },
      {
        id: 3,
        date: "6 Oct, 16:08",
        name: "Damac Phase 2 Mix",
        status: "COMPLETED",
        total: 174,
        sent: 56,
        delivered: 53,
        read: 29,
        failed: 117
      },

      {
        id: 4,
        date: "6 Oct, 16:08",
        name: "Damac Phase 2 Mix",
        status: "COMPLETED",
        total: 174,
        sent: 56,
        delivered: 53,
        read: 29,
        failed: 117
      },
      {
        id: 5,
        date: "6 Oct, 16:08",
        name: "Damac Phase 2 Mix",
        status: "COMPLETED",
        total: 174,
        sent: 56,
        delivered: 53,
        read: 29,
        failed: 117
      }
    ],
    
    subscriberStats: {
      total: 12701,
      whatsappOptedIn: 8942,
      activeSessions: 5321,
      eligibleForCampaigns: 7845,
      blockedDueToFailures: 156
    }
  };

  const getPercentage = (used: number, total: any | string) => {
    if (total === "∞") return 100;
    const percent = (used / total) * 100;
    return Math.min(percent, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border border-slate-200 shadow-sm rounded-xl px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary p-2 text-white shadow ring-2 ring-primary/30">
            <IconBell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">WhatsApp Campaign Dashboard</h2>
            <p className="text-sm text-slate-500">Monitor your WhatsApp messaging performance</p>
          </div>
        </div>
        <button onClick={() => navigate('/pages/whatsapp/run-campaign')} className="btn btn-primary btn-sm">
          <IconSend className="w-3 h-3 mr-2" /> New Campaign
        </button>
      </div>

     <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="overflow-y-auto flex-1">
            <table className="min-w-full">
            <thead>
                <tr className="border-b border-slate-200">
                <th className="text-left text-xs font-semibold text-slate-500 pb-3">Date & Name</th>
                <th className="text-left text-xs font-semibold text-slate-500 pb-3">Status</th>
                <th className="text-right text-xs font-semibold text-slate-500 pb-3">Sent</th>
                <th className="text-right text-xs font-semibold text-slate-500 pb-3">Delivered</th>
                <th className="text-right text-xs font-semibold text-slate-500 pb-3">Read</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {dashboardStats.recentCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-slate-50">
                    <td className="">
                    <div className="text-sm font-medium">{campaign.date}</div>
                    <div className="text-sm text-slate-600">{campaign.name}</div>
                    </td>
                    <td className="">
                    <span className={`inline-flex items-center px-2  rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                    </span>
                    </td>
                    <td className=" text-right text-sm font-medium">{campaign.sent.toLocaleString()}</td>
                    <td className=" text-right text-sm text-slate-600">{campaign.delivered.toLocaleString()}</td>
                    <td className=" text-right text-sm text-slate-600">{campaign.read.toLocaleString()}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
       </div>
    </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Phone Number Overview</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-500">Phone Number</label>
                <p className="font-semibold">{dashboardStats.phoneNumber}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Display Name</label>
                <p className="font-semibold text-primary">{dashboardStats.displayName}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-500">Messaging Limit</label>
                <p className="font-semibold">{dashboardStats.messagingLimit}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">MM Lite API</label>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  {dashboardStats.apiStatus}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-500">Quality Rating</label>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {dashboardStats.qualityRating}
                </span>
              </div>
              <div>
                <label className="text-sm text-slate-500">Phone Number Status</label>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {dashboardStats.phoneStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Delivery Stats */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Message Delivery Stats</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <StatCard 
                icon={<IconSend className="w-5 h-5" />}
                label="Sent"
                value={dashboardStats.deliveryStats.sent}
                color="blue"
              />
              <StatCard 
                icon={<IconMessage className="w-5 h-5" />}
                label="Delivered"
                value={dashboardStats.deliveryStats.delivered}
                color="emerald"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatCard 
                icon={<IconThumbUp className="w-5 h-5" />}
                label="Read"
                value={dashboardStats.deliveryStats.read}
                color="green"
              />
              <StatCard 
                icon={<IconThumbUp className="w-5 h-5" />}
                label="Failed"
                value={dashboardStats.deliveryStats.failed}
                color="red"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ icon, label, value, color }: { icon: any, label: string, value: string, color: 'blue' | 'emerald' | 'green' | 'purple' | 'red' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="flex items-center p-4 rounded-lg border border-slate-200">
      <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
        {icon}
      </div>
      <div className="ml-4">
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-xl font-bold text-slate-800">{value}</div>
      </div>
    </div>
  );
};

// Usage Bar Component
const UsageBar = ({ label, used, total, percentage }: { label: string, used: number, total: number | string, percentage: number }) => {
  const getColor = (percent: number) => {
    if (percent > 90) return 'bg-red-500';
    if (percent > 75) return 'bg-orange-500';
    return 'bg-primary';
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium text-slate-800">
          {used.toLocaleString()} / {total === "∞" ? "∞" : total.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${getColor(percentage)} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default CampaignDashboard;