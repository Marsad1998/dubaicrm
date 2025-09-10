import { createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import apiClient from '../utils/apiClient';
    interface FetchLeadsParams {
        page_number?: number;
        per_page?: number;
        sortField?: string;
        sortOrder?: string;
        search?: string;
        agent_id?: number;
        date_range?: string;
        lead_status?: number | string;
        dashboardType ?: string;
    }

    const endpoints = {
        createApi   : '/leads/store',
        listApi     : '/leads/get_all_leads?page=',
        destoryApi  : '/leads/delete',
        editApi     : '/leads/edit',
        updateLead  : '/leads/update_single_lead',
        uploadFiles : '/leads/upload_files',
        getfiles  : '/leads/get_files',
        deletefiles  : '/leads/delete_files',
        exportCsv    : '/leads/export_csv',
    };

    export const createLeads = createAsyncThunk('createlead', async ({ formData, id }: { formData: FormData; id?: number }, { rejectWithValue }) => {
        try {
            const url = id ? `${endpoints.createApi}/${id}` : endpoints.createApi;
            const response = await apiClient.post(url, formData);
            return {response: response.data.data, status: response.status};
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    });
    export const DashboardLeadslist = createAsyncThunk(
    'DashboardLeadslist',
        async (params: FetchLeadsParams = {}, { rejectWithValue }) => {
            try {
                const { 
                    page_number = 1, 
                    per_page = 10, 
                    sortField, 
                    sortOrder, 
                    search, 
                    agent_id, 
                    date_range,
                    lead_status,
                    dashboardType, 
                } = params;
                
                const effectivePage = page_number;
                const url = `${endpoints.listApi}${effectivePage}&lead_status=${lead_status || 0}`; 
                const response = await apiClient.post(url, {
                    search,
                    agent_id,
                    date_range,
                    lead_status,
                    per_page,
                    sort_field: sortField,
                    sort_order: sortOrder,
                    dashboardType:dashboardType
                });

                

                return {
                    leadsdata: response.data.data || [],
                    agents: response.data.agents || [],
                    statuses: response.data.statuses || [],
                    counters: response.data.counters || {},
                    meta: response.data.meta || {},
                    links: response.data.links || {},
                    total: response.data.meta?.total || 0,
                    last_page: response.data.meta?.last_page || 1,
                    current_page: response.data.meta?.current_page || 1,
                    per_page: response.data.meta?.per_page || 10,
                    lead_status: response.data.lead_status || 0,
                    topbarstatuses: response.data.topbar || [],
                    sidebarstatus: response.data.sidebar || [],
                    dropdownstatus: response.data.dropdown || [],
                    hrtopbar: response.data.hrtopbar || [], 
                    hrsidebar: response.data.hrsidebar || [], 
                    hrdropdown: response.data.hrdropdown || [],
                    dashboardType : dashboardType

                };
            } catch (error: any) {
                return rejectWithValue(error.response?.data || error.message);
            }
        }
    );


    export const updateSingleLead = createAsyncThunk('updateSingleLead', async ({ formData, id }: { formData: FormData; id?: number }, { rejectWithValue }) => {
        try {
            const url = id ? `${endpoints.updateLead}/${id}` : endpoints.updateLead;
            const response = await apiClient.post(url, formData);
            return {data: response?.data.data, status: response?.status};
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    });
    
    export const deleteLeads = createAsyncThunk('deleteleads', async (id: number, { rejectWithValue }) => { 
            try {
                await apiClient.delete(`${endpoints.destoryApi}/${id}`);
                return { id };
            } catch (error: any) {
                return rejectWithValue(error.response?.data || error.message);
            }
     });
    export const editLeads = createAsyncThunk('editleads', async (id: number, { rejectWithValue }) => { 
        try {
            const editResponse = await apiClient.get(`${endpoints.editApi}/${id}`); 
            return editResponse.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    });

    export const uploadFiles = createAsyncThunk('uploadFiles', async ({ leadId, files }: { leadId: number; files: FormData }, { rejectWithValue }) => {
    try {
        const response = await apiClient.post(`${endpoints.uploadFiles}/${leadId}`, files, {
            headers: { 'Content-Type': 'multipart/form-data', },
        });
        return response.data;
     } catch (error: any) {
        return rejectWithValue(error.response?.data || error.message);
     }
    });

    export const getFiles = createAsyncThunk('files/getFiles', async (leadId: number, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`${endpoints.getfiles}/${leadId}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    });

    export const deleteFiles = createAsyncThunk('files/deleteFiles', async (media_id: number, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`${endpoints.deletefiles}/${media_id}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    });

    const initialState = {
        leads: [] as Array<{ lead_id: number; files: any[]; }>,
        files: [] as any[],
        agents: [] as any[],
        statuses: [] as any[],
        lead_status: 0,
        success: false,
        loading: false,
        message: '',
        status: 0,
        total: 0,
        last_page: 1,
        current_page: 1,
        per_page: 10,
        counters: {},
        meta: {},
        links: {},
        topbarleadstatus : [],
        sidebarstatus : [],
        dropdownstatus : [], 
        hrtopbar :  [],
        hrsidebar : [],
        hrdropdown : [],
        dashboardType :  '',
    };
    
    const DashboardSlice = createSlice({
        name: 'Leads',
        initialState,
        reducers: {
            setLeads() {},
            deleteLeadsById() {},
            setLoading: (state, action) => {
                state.loading = action.payload;
            },
        },
        extraReducers: (builder) => {
            builder
                .addCase(createLeads.fulfilled, (state, action) => {
                    state.success = true;
                    state.status  =  action.payload.status
                })
                .addCase(createLeads.rejected, (state, action) => {
                    state.success = true;                
                    action.payload; 
                }).addCase(DashboardLeadslist.pending, (state) => {
                    state.loading = true;
                })
                .addCase(DashboardLeadslist.fulfilled, (state, action) => {
                    state.loading = false;
                    state.leads = action.payload.leadsdata;
                    state.agents = action.payload.agents;
                    state.statuses = action.payload.statuses;
                    state.counters = action.payload.counters;
                    state.meta = action.payload.meta;
                    state.links = action.payload.links;
                    state.total = action.payload.total;
                    state.last_page = action.payload.last_page;
                    state.current_page = action.payload.current_page;
                    state.per_page = action.payload.per_page;
                    state.lead_status = action.payload.lead_status;
                    state.topbarleadstatus  = action.payload.topbarstatuses;
                    state.sidebarstatus     = action.payload.sidebarstatus;
                    state.dropdownstatus    = action.payload.dropdownstatus;
                    state.hrtopbar   = action.payload.hrtopbar;
                    state.hrsidebar  = action.payload.hrsidebar;
                    state.hrdropdown = action.payload.hrdropdown;
                    state.dashboardType = action.payload.dashboardType ?? '';
                    state.success = true;
                })
                .addCase(DashboardLeadslist.rejected, (state) => {
                    state.loading = false;
                    state.success = false;
                })
                .addCase(updateSingleLead.pending, (state) => {
                    state.loading = true;  
                })
                .addCase(updateSingleLead.fulfilled, (state, action) => {
                    state.success = false;
                    state.status = action.payload.status;
                    state.lead_status = action.payload?.data?.[0].lead_status;
                    const updatedLead = action.payload?.data?.[0];
                    if (updatedLead) {
                        state.leads = state.leads.map(lead => lead.lead_id === updatedLead.lead_id ? updatedLead : lead);
                    }
                }).addCase(deleteLeads.fulfilled, (state, action) => {
                    state.success = true;
                    const { id } = action.payload;
                }).addCase(editLeads.fulfilled, (state, action) => {
                    state.leads = action.payload; 
                }).addCase(uploadFiles.fulfilled, (state, action) => {
                    const { leadId, files } = action.payload;
                    state.leads = state.leads.map(lead => {
                        if (lead.lead_id === leadId) {
                             return { ...lead, files: [...(lead.files || []), ...files] };
                        }
                        return lead;
                    });
                }) 
                .addCase(getFiles.fulfilled, (state, action) => {
                    state.loading = false;
                    state.files = action.payload;
                })
        }
    });
export const { setLeads, deleteLeadsById, setLoading } = DashboardSlice.actions;
export default DashboardSlice.reducer;