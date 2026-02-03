import React from 'react';
import IconAirplay from '../components/Icon/IconAirplay';
import IconUser from '../components/Icon/IconUser';
import IconListCheck from '../components/Icon/IconListCheck';
import IconThumbUp from '../components/Icon/IconThumbUp';
import IconStar from '../components/Icon/IconStar';
import IconFile from '../components/Icon/IconFile';
import IconSend from '../components/Icon/IconSend';
import IconCaretDown from '../components/Icon/IconCaretDown';
import IconInfoHexagon from '../components/Icon/IconInfoHexagon';
import IconBookmark from '../components/Icon/IconBookmark';
import IconTrash from '../components/Icon/IconTrash';
import IconCalendar from '../components/Icon/IconCalendar';
import IconSquareCheck from '../components/Icon/IconSquareCheck';
import IconUsersGroup from '../components/Icon/IconUsersGroup';
import { J } from '@fullcalendar/core/internal-common';

export const options = [
    { value: 1, label: 'Active' },
    { value: 2, label: 'Inactive' },
];

export const employeeType = [
    { value: 1, label: 'Sales Agent' },
    { value: 2, label: 'Salaried' },
];

export const documentTypes = [
    { value: 1, label: 'Emirates-ID' },  
    { value: 2, label: 'Passport' },
    { value: 3, label: 'Label Contract' },
    { value: 4, label: 'Offer Letter' }
];



export const STATUSES = [
    {
        value: 1,
        label: 'New Lead',
        displayIn: ['', '', '', 'commentsarray'],
        icon    : <IconAirplay className="w-3 h-3 ltr:mr-1 rtl:ml-1" />,
        outlineColor: 'btn-outline-dark',
        bgColor : 'bg-success',
        notes  : 'New Lead Created and Marked <span class="text-success">Interested </span>',
        notes2   : ' From Interested Lead',
        tab     : 'newtab',
        activeColor: "bg-dark text-white",
    },
    {
        value: 2,
        label: 'Assigned Lead',
        displayIn: ['dropdown', 'dashboard', 'matchcolorlist', 'commentsarray', 'uniqueDropdown'],
        icon: <IconListCheck className="w-5 h-5 ltr:mr-1 rtl:ml-1" />,
        outlineColor: 'btn-outline-dark',
        bgColor : 'bg-dark',
        notes  : '<span class="text-dark">Assigned </span> Lead to',
        notes2: ' From Assigned',
        tab   : 'assignedtab',
        activeColor: "bg-dark text-white",
    },
    {
        value: 3,
        label: 'Connected Lead',
        displayIn: ['dropdown', 'dashboard', 'matchcolorlist', 'commentsarray','uniqueDropdown'],
        icon: <IconStar className="w-5 h-5 ltr:mr-1 rtl:ml-1" />,
        outlineColor: 'btn-outline-secondary',
        bgColor : 'bg-secondary',
        notes  : ' Moved to: <span class="text-secondary">Connected </span>',
        notes2   : ' From Connected',
        tab   : 'connectedtab',
        activeColor: "btn-secondary text-white",
    },
    {
        value: 4,
        label: 'Cold Lead',
        displayIn: ['dropdown', 'dashboard', 'matchcolorlist', 'commentsarray', 'uniqueDropdown'],
        icon: <IconThumbUp className="w-5 h-5 ltr:mr-1 rtl:ml-1" />,
        outlineColor: 'btn-outline-success',
        bgColor : 'bg-success',
        notes : ' Moved to: <span class="text-success">Cold </span>',
        notes2  : ' From Cold',
        tab   : 'coldtab',
        activeColor: "bg-success text-white",
    },
    {
        value: 5,
        label: 'Warm Lead',
        displayIn: ['dropdown', 'dashboard', 'matchcolorlist', 'commentsarray', 'uniqueDropdown'],
        icon: <IconFile className="w-5 h-5 ltr:mr-1 rtl:ml-1" />,
        outlineColor: 'btn-outline-warning',
        bgColor : 'bg-warning',
        notes : ' Moved to: <span class="text-warning">Warm Lead</span>',
        notes2 : ' From Warm',
        tab   : 'warmtab',
        activeColor: "btn-warning text-white",
    },
    {
        value: 6,
        label: 'Hot Lead',
        displayIn: ['dropdown', 'dashboard', 'matchcolorlist', 'commentsarray', 'uniqueDropdown'],
        icon: <IconSend className="w-5 h-5 ltr:mr-1 rtl:ml-1" />,
        outlineColor: 'btn-outline-info',
        bgColor : 'bg-info',
        notes : ' Moved to: <span class="text-info">Hot </span> Leads',
        notes2 : ' From Hot',
        tab   : 'hottab',
        activeColor: "btn-info text-white",
    },
    {
        value: 7,
        label: 'Meeting Schedule',
        displayIn: ['dropdown', 'dashboard', 'matchcolorlist', 'commentsarray', 'uniqueDropdown'],
        icon: <IconCalendar className="w-5 h-5 ltr:mr-1 rtl:ml-1" />,
        outlineColor: 'btn-outline-primary',
        bgColor : 'bg-primary',
        notes  : ' Moved to: <span class="text-primary">Meeting Schedule </span>',
        notes2   : ' From Meeting Schedule',
        tab   : 'meetingtab',
        activeColor: "bg-primary text-white",
    },
    {
        value: 8,
        label: 'Meeting Complete',
        displayIn: ['dropdown', 'dashboard', 'matchcolorlist', 'commentsarray', 'uniqueDropdown'],
        icon: <IconUser className="w-5 h-5 ltr:mr-1 rtl:ml-1" />,
        outlineColor: 'btn-outline-secondary',
        bgColor : 'bg-secondary',
        notes  : ' Moved to: <span class="text-secondary">Meeting Complete </span>',
        notes2   : ' From Meeting Complete',
        tab   : 'meetingcompletetab',
        activeColor: "bg-secondary text-white",
    },
    {
        value: 9,
        label: 'No-Answer',
        // displayIn: ['sidebar', 'dropdown', 'matchcolorlist', 'commentsarray', 'uniqueDropdown'],
        displayIn: ['matchcolorlist', 'commentsarray'],
        icon: <IconInfoHexagon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />,
        outlineColor: 'bg-white text-secondary',
        bgColor : 'bg-secondary',
        notes  : ' Moved to: <span class="text-primary">No Answer </span>',
        notes2   : ' From No Answer',
        tab   : 'noanswertab',
        activeColor: "bg-white-dark/10 text-secondary",
    },
    {
        value: 10,
        label: 'Low-Budget',
        displayIn: ['sidebar', 'dropdown', 'matchcolorlist', 'commentsarray', 'uniqueDropdown'],
        icon: <IconBookmark className="w-5 h-5 ltr:mr-2 rtl:ml-2" />,
        outlineColor: 'bg-white text-secondary',
        bgColor : 'bg-secondary',
        notes  : ' Moved to: <span class="text-primary">Low-Budget</span>',
        notes2   : ' From Low Buget',
        tab   : 'lowbudgettab',
        activeColor: "bg-white-dark/10 text-secondary",
    },
    {
        value: 11,
        label: 'Not-Responding',
        displayIn: ['sidebar', 'dropdown', 'matchcolorlist', 'commentsarray', 'uniqueDropdown'],
        icon: <IconInfoHexagon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />,
        outlineColor: 'bg-white text-secondary',
        bgColor : 'bg-secondary',
        notes  : ' Moved to: <span class="text-primary">Not Responding </span> AnyMore',
        notes2   : ' From Not Responding AnyMore',
        tab     : 'notrespondingtab',
        activeColor: "bg-white-dark/10 text-secondary",
    },
    {
        value: 12,
        label: 'Incorrect Detail',
        displayIn: ['sidebar', 'dropdown', 'matchcolorlist', 'commentsarray', 'uniqueDropdown'],
        icon: <IconTrash className="w-5 h-5 ltr:mr-2 rtl:ml-2" />,
        outlineColor: 'bg-white text-secondary',
        bgColor : 'bg-secondary',
        notes  : ' Moved to: <span class="text-primary">Incorrect Detail </span>',
        notes2   : ' From Incorrect Detail',
        tab     : 'incorrecttab',
        activeColor: "bg-white-dark/10 text-secondary",
    },
    {
        value: 13,
        label: 'Agent',
        displayIn: ['sidebar', 'dropdown', 'matchcolorlist', 'commentsarray', 'uniqueDropdown'],
        icon: <IconUser className="w-5 h-5 ltr:mr-2 rtl:ml-2" />,
        outlineColor: 'bg-white text-secondary',
        bgColor : 'bg-primary',
        notes  : ' Moved to: <span class="text-primary">Agent </span>',
        notes2   : ' From Agent',
        tab     : 'agenttab',
        activeColor: "bg-white-dark/10 text-secondary",
    },
    {
        value: 14,
        label: 'Junk',
        displayIn: ['sidebar', 'dropdown', 'matchcolorlist', 'uniqueDropdown'],
        icon: <IconTrash className="w-5 h-5 ltr:mr-2 rtl:ml-2" />,
        outlineColor: 'bg-white text-secondary',
        bgColor : 'bg-primary',
        notes  : ' Moved to: <span class="text-primary">Junk </span>',
        notes2   : ' From Junk',
        tab     : 'junktab',
        activeColor: "bg-white-dark/10 text-secondary",
    },
    {
        value: 15,
        label: 'System Automatically Moved',
        displayIn: ['', '', ''],
        icon: <IconUser className="w-5 h-5 ltr:mr-2 rtl:ml-2" />,
        outlineColor: 'bg-white text-secondary',
        bgColor : 'bg-primary',
        notes  : 'System Automatically Move at 8 PM',
        notes2   : ' ',
    },
    {
        value: 16,
        label: 'Close Deal',
        displayIn: ['dropdown', '', '', 'uniqueDropdown'],
        icon: <IconUser className="w-5 h-5 ltr:mr-2 rtl:ml-2" />,
        outlineColor: 'bg-white text-secondary',
        bgColor : 'bg-primary',
        notes   : ' Congratulations Close Deal',
        notes2  : ' '
    },
    {
        value: 17,
        label: 'New Lead',
        displayIn: ['', '', ''],
        icon: <IconUser className="w-5 h-5 ltr:mr-2 rtl:ml-2" />,
        outlineColor: 'bg-white text-secondary',
        bgColor : 'bg-primary',
        notes   : ' New Lead Created By <span class="text-success">Meta Campaign </span> or System',
        notes2  : ' From Meta Campaign'
    },
    {
        value: 18,
        label: 'Confimations',
        displayIn: ['sidebar', 'dropdown', 'matchcolorlist'],
        icon: <IconThumbUp className="w-5 h-5 ltr:mr-2 rtl:ml-2" />,
        outlineColor: 'bg-white text-secondary',
        bgColor : 'bg-primary',
        notes  : ' Moved to: <span class="text-primary">Junk </span>',
        notes2   : ' From Junk',
        tab     : 'roadshowtab',
        activeColor: "bg-white-dark/10 text-secondary",
    },
    {
        value: 19,
        label: 'Follow-Up',
        displayIn: ['sidebar', 'dropdown', 'matchcolorlist', 'uniqueDropdown'],
        icon: <IconThumbUp className="w-5 h-5 ltr:mr-2 rtl:ml-2" />,
        outlineColor: 'bg-white text-secondary',
        bgColor : 'bg-primary',
        notes  : ' Moved to: <span class="text-primary">Follow-Up </span>',
        notes2   : ' From Follow-Up',
        tab     : 'followuptab',
        activeColor: "bg-white-dark/10 text-secondary",
    },
    {
        value: 20,
        label: 'Poll Leads',
        displayIn: ['matchcolorlist',],
        icon: <IconThumbUp className="w-5 h-5 ltr:mr-2 rtl:ml-2" />,
        outlineColor: 'bg-white text-secondary',
        bgColor : 'bg-primary',
        notes  : ' Moved to: <span class="text-primary">Poll Leads </span>',
        notes2   : ' From Poll Leads',
        tab     : 'pollleads',
        activeColor: "bg-white-dark/10 text-secondary",
    },
    
    // 1 to 50 statuses reserved for future use
    // Above 50 are custom hired statuses
    {
        value: 51,
        label: 'First Stage Interview',
        displayIn: ['hrdropdown', 'matchcolorlist', 'jobdashboard', 'commentsarray'],
        icon: <IconSquareCheck className="w-5 h-5 ltr:mr-2 rtl:ml-2 text-info-500" />,
        outlineColor: 'btn-outline-info',
        bgColor: 'bg-info',
        notes: 'Moved to: <span class="text-info-500">First Stage</span>',
        notes2: 'First Stage Interview',
        tab: 'firststagetab',
        activeColor: 'bg-info text-white',
    },
    {
        value: 52,
        label: 'Second Stage Interview',
        displayIn: ['hrdropdown', 'matchcolorlist', 'jobdashboard', 'commentsarray'],
        icon: <IconSquareCheck className="w-5 h-5 ltr:mr-2 rtl:ml-2 text-info-500" />,
        outlineColor: 'btn-outline-info',
        bgColor: 'bg-info',
        notes: 'Moved to: <span class="text-info-500">Second Stage</span>',
        notes2: 'From Second Stage',
        tab: 'seocndstagetab',
        activeColor: 'bg-info text-white',
    },
    {
        value: 53,
        label: 'Send Offer Letter',
        displayIn: ['hrdropdown', 'matchcolorlist', 'jobdashboard', 'commentsarray'],
        icon: <IconUsersGroup className="w-5 h-5 ltr:mr-2 rtl:ml-2 text-secondary-500" />,
        outlineColor: 'btn-outline-secondary',
        bgColor: 'bg-purple-500 text-white',
        notes: 'Moved to: <span class="text-secondary-500">Send Offer</span>',
        notes2: 'Send Offer Letter',
        tab: 'sendofferlettertab',
        activeColor: 'bg-secondary text-white',
    },
    {
        value: 54,
        label: 'Singed/Join',
        displayIn: ['hrdropdown', 'jobdashboard', 'matchcolorlist', 'commentsarray'],
        icon: <IconThumbUp className="w-5 h-5 ltr:mr-1 rtl:ml-1" />,
        outlineColor: 'btn-outline-success',
        bgColor : 'bg-success',
        notes : ' Moved to: <span class="text-success">Singed/Join </span>',
        notes2  : ' From Singed/Join',
        tab   : 'signedjointab',
        activeColor: "bg-success text-white",
    },
    {
        value: 55,
        label: 'Joined',
        displayIn: ['hrdropdown', 'jobdashboard', 'matchcolorlist', 'commentsarray'],
        icon: <IconThumbUp className="w-5 h-5 ltr:mr-1 rtl:ml-1" />,
        outlineColor: 'btn-outline-success',
        bgColor : 'bg-success',
        notes : ' Moved to: <span class="text-success"> Joined </span>',
        notes2  : ' From Joined',
        tab   : 'joinedtab',
        activeColor: "bg-success text-white",
    },
    {
        value: 56,
        label: 'Resigned/Terminate',
        displayIn: ['hrdropdown', 'jobdashboard', 'matchcolorlist', 'commentsarray'],
        icon: <IconThumbUp className="w-5 h-5 ltr:mr-1 rtl:ml-1" />,
        outlineColor: 'btn-outline-danger',
        bgColor : 'bg-danger',
        notes : ' Moved to: <span class="text-danger"> Resigned/Terminate </span>',
        notes2  : ' From Resigned/Terminate',
        tab   : 'resignedterminatetab',
        activeColor: "bg-danger text-white",
    },

    {
        value: 57,
        label: 'Not Qualified',
        displayIn: ['hrdropdown', 'matchcolorlist', 'jobdashboard'],
        icon: <IconUsersGroup className="w-5 h-5 ltr:mr-2 rtl:ml-2 text-danger-500" />,
        outlineColor: 'btn-outline-danger',
        bgColor: 'bg-danger',
        notes: 'Moved to: <span class="text-success-500"> Not Qualified </span>',
        notes2: 'From Not Qualified',
        tab: 'notqualifiedtab',
        activeColor: 'bg-danger text-white',
    },
    {
        value: 58,
        label: 'Call | No Answer',
        displayIn: ['hrdropdown', 'matchcolorlist',  'commentsarray', 'hrsidebar',],
        icon: <IconThumbUp className="w-5 h-5 ltr:mr-2 rtl:ml-2" />,
        outlineColor: 'bg-white text-secondary',
        bgColor : 'bg-primary',
        notes  : ' Moved to: <span class="text-primary">Call | No Answer </span>',
        notes2   : ' From Call | No Answer',
        tab     : 'callnoanswertab',
        activeColor: "bg-white-dark/10 text-secondary",
    },

];

export const statues           = ()   => STATUSES;
export const topBarStatus      = ()   => STATUSES.filter((status) => status.displayIn?.includes('dashboard'));
export const SidebarStatus     = ()   => STATUSES.filter((status) => status.displayIn?.includes('sidebar'));
export const HrSidebarStatus   = ()   => STATUSES.filter((status) => status.displayIn?.includes('hrsidebar'));
export const MatchColorList    = ()   => STATUSES.filter((status) => status.displayIn?.includes('matchcolorlist'));
export const HRDropdownOption  = ()   => STATUSES.filter((status) => status.displayIn?.includes('hrdropdown'));
export const JobDashboard      = ()   => STATUSES.filter((status) => status.displayIn?.includes('jobdashboard'));
export const uniqueDropdown    = ()   => STATUSES.filter((status) => status.displayIn?.includes('uniqueDropdown'));

//  country list
export const CountryList = [
    {
      value: 'Delhi',
      name: 'Delhi',
    },
    {
      value: 'Vienna',
      name: 'Vienna',
    },
    {
      value: 'Prague',
      name: 'Prague',
    },
    {
      value: 'Canada',
      name: 'Canada',
    },
    {
      value: 'USA',
      name: 'USA',
    },
    {
      value: 'Riyadh',
      name: 'Riyadh',
    },

    {
      value: 'Dammam',
      name: 'Dammam',
    },
    {
      value: 'Bangalore',
      name: 'Bangalore',
    },
    {
      value: 'Chennai',
      name: 'Chennai',
    },
    {
      value: 'Australia',
      name: 'Australia',
    },
    {
      value: 'Netherlands',
      name: 'Netherlands',
    },
    
    

  ];
  
  export const Rentoptions = [
    { value: 1, label: 'Rented' },
    { value: 2, label: 'Vacant' },
];

 export const Saleoptions = [
    { value: 1, label: 'Off-Plan' },
    { value: 2, label: 'Ready' },
];

 export const RentalPeriodOption = [
    { value: 1, label: 'Yearly' },
    { value: 2, label: 'Monthly' },
    { value: 3, label: 'Weekly' },
    { value: 4, label: 'Daily' },
];

export const LeadsOption = [
    { value: 1, label: 'Agent-Leads' },
    { value: 2, label: 'HR-Leads' },
];

export const leaveTypes = [
  { value: 1, label: 'Annual Leave' },
  { value: 2, label: 'Sick Leave' },
  { value: 3, label: 'Maternity Leave' },
  { value: 4, label: 'Paternity Leave' },
  { value: 5, label: 'Unpaid Leave' },
  { value: 6, label: 'Compensatory Leave' },
  { value: 7, label: 'Bereavement Leave' },      
  { value: 8, label: 'Marriage Leave' },        
  { value: 9, label: 'Casual Leave' },          
  { value: 10, label: 'Study Leave' },       
  { value: 11, label: 'Sabbatical Leave' },      
  { value: 12, label: 'Public Holiday' },       
  { value: 13, label: 'Voting Leave' },          
];

export const approvalStatusOptions = [
    { value: 0, label: 'InActive' },
    { value: 1, label: 'Pending to Approval' },
    { value: 2, label: 'Leave Approved' },
    { value: 3, label: 'Leave Rejected' },
];

export const languagesDropdown = [
  { value: 1, label: 'English' },
  { value: 2, label: 'Russian' },
  { value: 3, label: 'Spanish' },
  { value: 4, label: 'Arabic' },
  { value: 5, label: 'French' }, 
];









