import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../dashboard/dashboard.css';
import { getBaseUrl } from '../../components/BaseUrl';
import apiClient from '../../utils/apiClient';
import Toast from '../../services/toast';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import IconBell from '../../components/Icon/IconBell';
import IconPlus from '../../components/Icon/IconPlus';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import Table from '../../components/Table';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import { DataTableSortStatus } from 'mantine-datatable';
import Swal from 'sweetalert2';

const endpoints = {
    loadTemplateApi:`${getBaseUrl()}/whatsapp/load-template`,
    listApi:`${getBaseUrl()}/whatsapp/show`,
};



const RunCampaign = () => {

}