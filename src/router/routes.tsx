import { lazy } from 'react';
const Analytics = lazy(() => import('../pages/Analytics'));
const LoginBoxed = lazy(() => import('../pages/Authentication/LoginBoxed'));
const RegisterBoxed = lazy(() => import('../pages/Authentication/RegisterBoxed'));
const UnlockBoxed = lazy(() => import('../pages/Authentication/UnlockBox'));
const RecoverIdBoxed = lazy(() => import('../pages/Authentication/RecoverIdBox'));
const LoginCover = lazy(() => import('../pages/Authentication/LoginCover'));
const Error = lazy(() => import('../components/Error'));
const BlogCreate = lazy(() => import('../pages/Blogs/Create'));
const BlogList = lazy(() => import('../pages/Blogs/list'));
const NewsCreate = lazy(() => import('../pages/news/create'));
const NewsList = lazy(() => import('../pages/news/list'));
const CreateDevelopers = lazy(() => import('../pages/developers/create'));
const ListDevelopers = lazy(() => import('../pages/developers/list'));
const ListAmenities = lazy(() => import('../pages/amenities/list'));
const DashboardBox = lazy(() => import('../pages/dashboard/dashboard'));
const Users = lazy(() => import('../pages/Users/Users'));
const Roles = lazy(() => import('../pages/Roles/roles'));
const Leaves = lazy(() => import('../pages/Users/Leaves'));
const Dashboardanalysis = lazy(() => import('../pages/dashboard/leadsanalysis'));
import ProtectedRoute from '../components/ProtectedRoute';
import AssignPermission from '../pages/Permissions/AssignPermission';
const Assign = lazy(() => import('../pages/leads/assign'));
const ReAssign = lazy(() => import('../pages/leads/reassign'));
const WonLeads = lazy(() => import('../pages/leads/won'));
const ExportLeads = lazy(() => import('../pages/leads/exportpdf'));
const RoadShow = lazy(() => import('../pages/leads/roadshow'));
const Reports = lazy(() => import('../pages/leads/reports'));
const Profile = lazy(() => import('../pages/Users/profile'));
const Error404 = lazy(() => import('../pages/errors/error404'));
const Activities = lazy(() => import('../pages/activities/activities'));
const ActivitiesRequest = lazy(() => import('../pages/activities/Activities_Request'));
const EmailTemplate = lazy(() => import('../pages/emails/template'));
const EmailPreview = lazy(() => import('../pages/emails/preview'));
const EmailSubscriber = lazy(() => import('../pages/emails/subscriber'));
const AnalyticsDashboard = lazy(() => import('../pages/emails/analyticsDashboard'));
const EmailReportList = lazy(() => import('../pages/emails/email-report'));
const Createannouncements = lazy(() => import('../pages/announcements/create'));
const Viewannouncements = lazy(() => import('../pages/announcements/view'));
// listing
const CreateListing = lazy(() => import('../pages/listing/createListing'));
const Statuses = lazy(() => import('../pages/statuses/create'));

const Kpi = lazy(() => import('../pages/kpi/create'));
const KPIDashboard = lazy(() => import('../pages/kpi/kpidashboard'));



const routes = [
    {
        path: '/',
        type: 'protected',
        element: <Dashboardanalysis key="default" />, 
    },
    
    {
        path: 'pages/leads/dashboard',
        type: 'protected',
        element: <DashboardBox key="dashboard" />,
    },

    {
        path: '/dashboard/:dashboardType',
        type: 'protected',
        element: <DashboardBox key="dashboard" />,
    },

    {
        path: 'pages/leads/assign',
        type: 'protected',
        element : <Assign/>,
        layout: 'default',
    },
    {
        path: 'pages/leads/reassign',
        type: 'protected',
        element : <ReAssign/>,
        layout: 'default',
    },
    {
        path: 'pages/leads/won',
        type: 'protected',
        element : <WonLeads/>,
        layout: 'default',
    },
    {
        path: 'pages/leads/exportpdf',
        type: 'protected',
        element : <ExportLeads/>,
        layout: 'default',
    },
    {
        path: 'pages/leads/roadshow',
        type: 'protected',
        element : <RoadShow/>,
        layout: 'default',
    },

    {
        path: 'pages/leads/reports',
        type: 'protected',
        element : <Reports/>,
        layout: 'default',
    },

    {
        path: 'pages/activities/activities',
        type: 'protected',
        element : <Activities/>,
        layout: 'default',
    },

    {
        path: 'pages/activities/activities_request',
        type: 'protected',
        element : <ActivitiesRequest/>,
        layout: 'default',
    },

    // Email Template
    {
        path: 'pages/email/template',
        type: 'protected',
        element : <EmailTemplate/>,
        layout: 'default',
    },
    {
        path: 'pages/email/preview',
        type: 'protected',
        element: <EmailPreview />, 
        layout: 'default',
    },

    {
        path: 'pages/email/subscriber',
        type: 'protected',
        element: <EmailSubscriber />, 
        layout: 'default',
    },
    {
        path: 'pages/email/analyticsDashboard',
        type: 'protected',
        element: <AnalyticsDashboard />, 
        layout: 'default',
    },

    {
        path: 'pages/email/email-report-list',
        type: 'protected',
        element: <EmailReportList />, 
        layout: 'default',
    },
    {
        path: 'pages/announcements/create',
        type: 'protected',
        element: <Createannouncements />, 
        layout: 'default',
    },

    {
        path: 'pages/announcements/view',
        type: 'protected',
        element: <Viewannouncements />, 
        layout: 'default',
    },
    
    {
        path: 'pages/listing/create-listing',
        type: 'protected',
        element: <CreateListing />, 
        layout: 'default',
    }, 

    {
        path: 'pages/statuses/create',
        type: 'protected',
        element: <Statuses />, 
        layout: 'default',
    }, 

    {
        path: 'pages/kpi/create',
        type: 'protected',
        element: <Kpi />, 
        layout: 'default',
    },

    {
        path: 'pages/kpi/kpi_dashboard',
        type: 'protected',
        element: <KPIDashboard />, 
        layout: 'default',
    },

    {
        path: '/analytics',
        type: 'protected',
        element: <Analytics />,
    },
    {
        path: '/auth/boxed-signin',
        element: <LoginBoxed />,
        layout: 'blank',
    },
    {
        path: '/auth/boxed-signup',
        element: <RegisterBoxed />,
        layout: 'blank',
    },
    {
        path: '/auth/boxed-lockscreen',
        element: <UnlockBoxed />,
        layout: 'blank',
    },
    {
        path: '/auth/boxed-password-reset',
        element: <RecoverIdBoxed />,
        layout: 'blank',
    },
    {
        path: '/auth/cover-login',
        element: <LoginCover />,
        layout: 'blank',
    },
    {
        path: 'pages/blogs/create/:id?',
        type: 'protected',
        element : <BlogCreate/>,
        layout: 'default',
    },
    {
        path: 'pages/blogs/list',
        type: 'protected',
        element : <BlogList/>,
        layout: 'default',
    },
    {
        path: 'pages/news/create/:id?',
        type: 'protected',
        element : <NewsCreate/>,
        layout: 'default',
    },
    {
        path: 'pages/news/list',
        type: 'protected',
        element : <NewsList/>,
        layout: 'default',
    },

    {
        path: 'pages/developers/create/:id?',
        type: 'protected',
        element : <CreateDevelopers/>,
        layout: 'default',
    },
    {
        path: 'pages/developers/list',
        type: 'protected',
        element : <ListDevelopers/>,
        layout: 'default',
    },
    {
        path: 'pages/amenities/list',
        type: 'protected',
        element : <ListAmenities/>,
        layout: 'default',
    },

    {
        path: 'pages/users/create',
        type: 'protected',
        element : <Users/>,
        layout: 'default',
    },
    {
        path: 'pages/roles/create',
        type: 'protected',
        element : <Roles/>,
        layout: 'default',
    },

    {
        path: 'pages/users/leave-request',
        type: 'protected',
        element : <Leaves/>,
        layout: 'default',
    },


    {
        path: 'pages/users/profile',
        type: 'protected',
        element : <Profile/>,
        layout: 'default',
    },

    {
        path: 'pages/permissions/assign',
        type: 'protected',
        element : <AssignPermission/>,
        layout: 'default',
    },

    {
        path: 'error',
        type: 'protected',
        element : <Error404/>,
        layout: 'default',
    },

    {
        path: '*',
        element:  ( <ProtectedRoute> <Error /> </ProtectedRoute> ),
        layout: 'blank',
    },
];

export { routes };
