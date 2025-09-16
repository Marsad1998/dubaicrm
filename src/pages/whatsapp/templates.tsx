import { useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { useLocation, useNavigate } from 'react-router-dom';
import '../dashboard/dashboard.css';
import AnimateHeight from 'react-animate-height';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import { getBaseUrl } from '../../components/BaseUrl';
import apiClient from '../../utils/apiClient';
import Toast from '../../services/toast';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import IconBell from '../../components/Icon/IconBell';
import IconPlus from '../../components/Icon/IconPlus';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';

const endpoints = {
    loadTemplateApi    : `${getBaseUrl()}/whatsapp/load-template`,
};

const Templates = () => {
    const navigate    = useNavigate();
     const dispatch   = useDispatch<AppDispatch>();
    const toast       = Toast();

    const LoadTemplate = async () => {
         const response = await apiClient.get(endpoints.loadTemplateApi);
         console.log(response)
    } 


    return (
        <div>
            <div className="panel flex items-center justify-between overflow-visible whitespace-nowrap p-3 text-dark relative">
                <div className="flex items-center">
                    <div className="rounded-full bg-primary p-1.5 text-white ring-2 ring-primary/30 ltr:mr-3 rtl:ml-3"> <IconBell /> </div>
                        <span className="ltr:mr-3 rtl:ml-3">Details of Your Whatsapp Templates: </span>
                    </div>
                  <div className="">
                    <button className="btn btn-secondary btn-sm" onClick={LoadTemplate} type="button"> Load Template </button>
                </div>
            </div>
            <div className="panel mt-6">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur quas nobis esse neque dolor aliquid nesciunt commodi consectetur, laborum quae sint accusamus qui adipisci iste quibusdam quisquam. Enim, omnis deleniti.
            </div>
        </div>
    );
};

export default Templates;
