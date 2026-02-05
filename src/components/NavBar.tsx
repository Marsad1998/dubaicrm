import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { IRootState } from '../store';
import AnimateHeight from 'react-animate-height';
import IconCaretDown from './Icon/IconCaretDown';
import IconMenuDashboard from './Icon/Menu/IconMenuDashboard';
import IconMenuElements from './Icon/Menu/IconMenuElements';
import IconMenuDatatables from './Icon/Menu/IconMenuDatatables';
import IconMultipleForwardRight from './Icon/IconMultipleForwardRight';

const NavBar = () => {
  const { t } = useTranslation();
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const menuType = themeConfig.menu; 

  const [permissions, setPermissions] = useState<any>([]);
  const [role, setRoles] = useState<string>();
  const [currentMenu, setCurrentMenu] = useState<string>('');

  useEffect(() => {
    const storedPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
    const userrole = localStorage.getItem('role') || '';
    setPermissions(storedPermissions);
    setRoles(userrole);
  }, []);

  const toggleMenu = (menu: string) => {
    setCurrentMenu((old) => (old === menu ? '' : menu));
  };

  const isVertical = menuType === 'vertical';

  const renderSubMenu = (menuKey: string, children: React.ReactNode) => {
    if (isVertical) {
      return (
        <AnimateHeight duration={300} height={currentMenu === menuKey ? 'auto' : 0}>
          <ul className="sub-menu">{children}</ul>
        </AnimateHeight>
      );
    }
    return <ul className="sub-menu">{children}</ul>;
  };

  return (
    <ul
      className={
        isVertical
          ? 'relative font-semibold space-y-0.5 p-4 py-0'
          : 'horizontal-menu hidden py-1.5 font-semibold px-6 lg:space-x-1.5 xl:space-x-8 rtl:space-x-reverse bg-white border-t border-[#ebedf2] dark:border-[#191e3a] dark:bg-black text-black dark:text-white-dark'
      }
    >
      {/* Leads Management */}
      {(permissions.includes('view dashboard') || role === 'super admin') && (
        <li className="menu nav-item relative">
          <button
            type="button"
            className={`nav-link ${isVertical && currentMenu === 'leads' ? 'active' : ''}`}
            onClick={() => isVertical && toggleMenu('leads')}
          >
            <div className="flex items-center">
              <IconMenuDashboard className="shrink-0" />
              <span className="px-1">{t('Leads Management')}</span>
            </div>
            <div className={`${isVertical && currentMenu !== 'leads' ? 'rtl:rotate-90 -rotate-90' : ''}`}>
              <IconCaretDown />
            </div>
          </button>

          {renderSubMenu(
            'leads',
            <>
              {/* <li><NavLink to="/pages/leads/dashboard">{t('Lead-Dashboard')}</NavLink></li> */}
              <li><NavLink to="/pages/leads/dashboard2">{t('Lead-Dashboard')}</NavLink></li>

              {role === 'super admin' && (
                <li><NavLink to="/pages/leads/hr">{t('HR Dashboard')}</NavLink></li>
              )}

              {(permissions.includes('assign leads') || role === 'super admin') && (
                <>
                  <li><NavLink to="/pages/leads/assign">{t('New-Leads')}</NavLink></li>
                  <li><NavLink to="/pages/leads/reassign">{t('Re-Assign')}</NavLink></li>
                </>
              )}

              {(permissions.includes('won leads') || role === 'super admin') && (
                <li><NavLink to="/pages/leads/won">{t('Won-Leads')}</NavLink></li>
              )}
            </>
          )}
        </li>
      )}
      
      {(permissions.includes('roadshow leads') || role === 'super admin') && (
        <li className="menu nav-item relative">
          <button type="button" className={`nav-link ${isVertical && currentMenu === 'leadtools' ? 'active' : ''}`} onClick={() => isVertical && toggleMenu('leadtools')}>
            <div className="flex items-center">
              <IconMenuDashboard className="shrink-0" />
              <span className="px-1">{t('Lead Tools')}</span>
            </div>
            <div className={`${isVertical && currentMenu !== 'leadtools' ? 'rtl:rotate-90 -rotate-90' : ''}`}>
              <IconCaretDown />
            </div>
          </button>
          {renderSubMenu(
            'leadtools',
            <>
              {(permissions.includes('view pdf') || role === 'super admin') && (
                <li><NavLink to="/pages/leads/exportpdf">{t('Export Pdf')}</NavLink></li>
              )}
              <li><NavLink to="/pages/leads/roadshow">{t('Road-Show Leads')}</NavLink></li>
              <li><NavLink to="/pages/leads/reports">{t('Agent Reports')}</NavLink></li>
              <li><NavLink to="/pages/leads/poll-leads">{t('Poll Leads')}</NavLink></li>
            </>
          )}
        </li>
      )}

      {(permissions.includes('create user') || role === 'super admin') && (
        <li className="menu nav-item relative">
          <button
            type="button"
            className={`nav-link ${isVertical && currentMenu === 'employee' ? 'active' : ''}`}
            onClick={() => isVertical && toggleMenu('employee')}
          >
            <div className="flex items-center">
              <IconMenuElements className="shrink-0" />
              <span className="px-1">{t('Manage Employee')}</span>
            </div>
            <div className={`${isVertical && currentMenu !== 'employee' ? 'rtl:rotate-90 -rotate-90' : ''}`}>
              <IconCaretDown />
            </div>
          </button>
          {renderSubMenu(
            'employee',
            <>
              {(permissions.includes('create role') || role === 'super admin') && (
                <li><NavLink to="/pages/roles/create">{t('Add-Role')}</NavLink></li>
              )}
              {(permissions.includes('view permission') || role === 'super admin') && (
                <li><NavLink to="/pages/permissions/assign">{t('Assign-Permission')}</NavLink></li>
              )}
              {(permissions.includes('create user') || role === 'super admin') && (
                <>
                  <li><NavLink to="/pages/users/create">{t('Add Employee')}</NavLink></li>
                  <li><NavLink to="/pages/users/leave-request">{t('Leave Request')}</NavLink></li>
                </>
              )}
            </>
          )}
        </li>
      )}

      
      {/* {(permissions.includes('create activities') || role === 'super admin') && (
        <li className="menu nav-item relative">
          <button
            type="button"
            className={`nav-link ${isVertical && currentMenu === 'diary' ? 'active' : ''}`}
            onClick={() => isVertical && toggleMenu('diary')}
          >
            <div className="flex items-center">
              <IconMenuDatatables className="shrink-0" />
              <span className="px-1">{t('Agent Diary')}</span>
            </div>
            <div className={`${isVertical && currentMenu !== 'diary' ? 'rtl:rotate-90 -rotate-90' : ''}`}>
              <IconCaretDown />
            </div>
          </button>
          {renderSubMenu(
            'diary',
            <>
              <li><NavLink to="/pages/activities/activities">{t('Meeting Request')}</NavLink></li>
              <li><NavLink to="/pages/activities/activities_request">{t('Check Requests')}</NavLink></li>
            </>
          )}
        </li>
      )} */}

      
       {(permissions.includes('create subscriber') || role === 'super admin') && (
        <li className="menu nav-item relative">
          <button
            type="button"
            className={`nav-link ${isVertical && currentMenu === 'listing' ? 'active' : ''}`}
            onClick={() => isVertical && toggleMenu('listing')}
          >
            <div className="flex items-center">
              <IconMenuDashboard className="shrink-0" />
              <span className="px-1">{t('Listing')}</span>
            </div>
            <div className={`${isVertical && currentMenu !== 'listing' ? 'rtl:rotate-90 -rotate-90' : ''}`}>
              <IconCaretDown />
            </div>
          </button>
          {renderSubMenu(
            'listing',
            <li><NavLink to="/pages/listing/create-listing">{t('Create Listing')}</NavLink></li>
          )}
        </li>
      )} 
      
      {/* Announcements */}
      <li className="menu nav-item relative">
        <button
          type="button"
          className={`nav-link ${isVertical && currentMenu === 'announcements' ? 'active' : ''}`}
          onClick={() => isVertical && toggleMenu('announcements')}
        >
          <div className="flex items-center">
            <IconMenuElements className="shrink-0" />
            <span className="px-1">{t('Announcements')}</span>
          </div>
          <div className={`${isVertical && currentMenu !== 'announcements' ? 'rtl:rotate-90 -rotate-90' : ''}`}>
            <IconCaretDown />
          </div>
        </button>
        {renderSubMenu(
          'announcements',
          <>
            {(permissions.includes('create announcements') ||
              role === 'super admin' ||
              role === 'HR' ||
              role === 'receptionist') && (
              <li><NavLink to="/pages/announcements/create">{t('Add Announcements')}</NavLink></li>
            )}
            <li><NavLink to="/pages/announcements/view">{t('View Announcements')}</NavLink></li>
          </>
        )}
      </li>

      {/* Leads Stages */}
      {(permissions.includes('create stages') || role === 'super admin') && (
        <li className="menu nav-item relative">
          <button
            type="button"
            className={`nav-link ${isVertical && currentMenu === 'stages' ? 'active' : ''}`}
            onClick={() => isVertical && toggleMenu('stages')}
          >
            <div className="flex items-center">
              <IconMenuElements className="shrink-0" />
              <span className="px-1">{t('Leads Stages')}</span>
            </div>
            <div className={`${isVertical && currentMenu !== 'stages' ? 'rtl:rotate-90 -rotate-90' : ''}`}>
              <IconCaretDown />
            </div>
          </button>
          {renderSubMenu(
            'stages',
            <li><NavLink to="/pages/statuses/create">{t('Add Lead Stages')}</NavLink></li>
          )}
        </li>
      )}
      {/* KPI */}
      {(permissions.includes('kpi create') || permissions.includes('kpi dashboard') || role === 'super admin') && (
        <li className="menu nav-item relative">
          <button
            type="button"
            className={`nav-link ${isVertical && currentMenu === 'kpi' ? 'active' : ''}`}
            onClick={() => isVertical && toggleMenu('kpi')}
          >
            <div className="flex items-center">
              <IconMenuElements className="shrink-0" />
              <span className="px-1">{t(`kpi'S`)}</span>
            </div>
            <div className={`${isVertical && currentMenu !== 'kpi' ? 'rtl:rotate-90 -rotate-90' : ''}`}>
              <IconCaretDown />
            </div>
          </button>
          {renderSubMenu(
            'kpi',
            <>
              {(permissions.includes('kpi create') || role === 'super admin') && (
                <li><NavLink to="/pages/kpi/create">{t(`kpi'S Task`)}</NavLink></li>
              )}
              {(permissions.includes('kpi dashboard') || role === 'super admin') && (
                <li><NavLink to="/pages/kpi/kpi_dashboard">{t(`kpi'S Dashboard`)}</NavLink></li>
              )}
            </>
          )}
        </li>
      )}


      {(permissions.includes('manage marketing')) && (
          <li className="menu nav-item relative">
          <button
            type="button"
            className={`nav-link ${isVertical && currentMenu === 'subscribers' ? 'active' : ''}`}
            onClick={() => isVertical && toggleMenu('subscribers')}
          >
            <div className="flex items-center">
              <IconMultipleForwardRight className="shrink-0" />
              <span className="px-1">{t(`Our Subscribers`)}</span>
            </div>
            <div className={`${isVertical && currentMenu !== 'subscribers' ? 'rtl:rotate-90 -rotate-90' : ''}`}>
              <IconCaretDown />
            </div>
          </button>
          {renderSubMenu(
            'subscribers',
            <>
                <NavLink to="/pages/email/subscriber">{t('Create-Subscriber')}</NavLink>
            </>
          )}
        </li>
       )} 
       
      {(permissions.includes('manage marketing')) && (
          <li className="menu nav-item relative">
          <button
            type="button"
            className={`nav-link ${isVertical && currentMenu === 'emailtool' ? 'active' : ''}`}
            onClick={() => isVertical && toggleMenu('emailtool')}
          >
            <div className="flex items-center">
              <IconMultipleForwardRight className="shrink-0" />
              <span className="px-1">{t(`Email Marketing`)}</span>
            </div>
            <div className={`${isVertical && currentMenu !== 'emailtool' ? 'rtl:rotate-90 -rotate-90' : ''}`}>
              <IconCaretDown />
            </div>
          </button>
          {renderSubMenu(
            'emailtool',
            <>
                <NavLink to="/pages/email/template">{t('Create-Campaign')}</NavLink>
                <NavLink to="/pages/email/analyticsDashboard">{t('Tracking Dashboard')}</NavLink>
                <NavLink to="/pages/email/email-report-list">{t('Report List')}</NavLink>
            </>
          )}
        </li>
       )} 
       
       {(permissions.includes('manage marketing')) && (
          <li className="menu nav-item relative">
          <button type="button" className={`nav-link ${isVertical && currentMenu === 'whatsappool' ? 'active' : ''}`} onClick={() => isVertical && toggleMenu('whatsappool')}>
            <div className="flex items-center">
              <IconMultipleForwardRight className="shrink-0" />
              <span className="px-1">{t(`Whatsap Marketing`)}</span>
            </div>
            <div className={`${isVertical && currentMenu !== 'whatsappool' ? 'rtl:rotate-90 -rotate-90' : ''}`}> <IconCaretDown /> </div>
          </button>
          {renderSubMenu('whatsappool',
            <>
              <NavLink to="/pages/whatsapp/campaign-dashboard">{t('Campaign Dashboard')}</NavLink>
              <NavLink to="/pages/whatsapp/run-campaign">{t('Start Campaign')}</NavLink>
              <NavLink to="/pages/whatsapp/templates">{t('Whatsapp Templates')}</NavLink>
              <NavLink to="/pages/whatsapp/chat">{t('Messages Chat')}</NavLink>

            </>
          )}
        </li>
       )} 

    </ul>
  );
};

export default NavBar;


