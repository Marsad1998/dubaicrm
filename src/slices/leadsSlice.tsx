import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../utils/apiClient';

    const endpoints = {
        listApi          : '/leads/new-unassigned-lead',
        destoryApi       : '/leads/delete_leads',
        reAssignApi      : '/leads/reassign-lead-list',
        closeLeadsApi    : '/leads/close-deal',
        pollLeadsApi    : '/leads/poll-leads',
        allLeadsApi      : '/leads/all-leads',
        pdfurl           : 'leads/filter-pdf-data',
        roadshowLeadApi  : 'leads/roadshow-leads',
        assignLeadsApi   : 'leads/assign-multiple-lead',
        takebackleads    : 'leads/take_back_leads',
        takePollleads    : 'leads/take_poll_leads',
        moveleadtocold  : 'leads/send_lead_cold',
        LeadSummaryReportUrl : 'leads/lead-summary-report',
        LeadCampaignReportUrl : 'leads/lead-campaign-report',
    };
    
    const initialState = {
        leads: [] as Array<{ lead_id: number; files: any[]; }>,
        files: [] as any[],
        agents       : [] as { client_user_designation: JSX.Element; client_user_id: number,  client_user_name: string, client_user_phone: number, }[],
        lead_status  : 0,
        success      : false,
        loading      : false,
        message      : '',
        status       : 0,
        statuses     : [],
        total_leads  : 0,
        agent_name   : '',
        total        : 0,
        last_page    : 1,
        current_page : 1,
        per_page     : 10
    };
    
    interface FetchLeadsParams {
        page?: number;
        perPage?: number;
        sortField?: string;
        sortOrder?: string;
        search? : string;
        cityname?: string;
        date_range?: string;
        agent_id?: any;
        status_id?: any;
        campaign_id?: any;
        idsOnly?: boolean;
    }

    export const newleads = createAsyncThunk('leads/newleads', async (params: FetchLeadsParams = {}, { rejectWithValue }) => {
            try {
                const { page = 1, perPage = 10, sortField, sortOrder, search, cityname  } = params;
                const effectivePage = search ? 1 : page;
                const response = await apiClient.get(endpoints.listApi, {
                    params: { page : effectivePage, per_page: perPage, sort_field: sortField, sort_order: sortOrder, search: search, cityname: cityname },
                });
                return {
                    data: response.data.data.data,
                    agents: response.data.agents,
                    total: response.data.data.total,
                    last_page: response.data.data.last_page,
                    current_page: response.data.data.current_page,
                    per_page: response.data.data.per_page,
                    
                };
            } catch (error: any) {
                return rejectWithValue(error.response?.data || error.message);
            }
        }
    );

    export const assignleads = createAsyncThunk('assignleads', async ({ formData }: { formData: FormData; }, { rejectWithValue }) => {
        
        try {
            const response = await apiClient.post(endpoints.assignLeadsApi, formData);
            return { data: response?.data.data, status: response?.status};
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    });

    export const destoryLeads = createAsyncThunk('destoryleads', async ({ formData }: { formData: FormData; }, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.destoryApi, formData);
            return {data: response?.data.data, status: response?.status};
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    });

    export const reassigleads = createAsyncThunk('leads/reassigleads', async (params: FetchLeadsParams = {}, { rejectWithValue }) => {
        try {
            const { page = 1, perPage = 10, sortField, sortOrder, search  } = params;
            const effectivePage = search ? 1 : page;
            const response = await apiClient.get(endpoints.reAssignApi, {
                params: { page:effectivePage, per_page: perPage, sort_field: sortField, sort_order: sortOrder, search: search },
            });

            console.log(response.data);
            return {
                // data: response.data.data.data,
                data: response.data.data,
                agents: response.data.agents,
                total: response.data.total,
                last_page: response.data.last_page,
                current_page: response.data.current_page,
                per_page: response.data.per_page, 
            };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    });

    export const pollLeads = createAsyncThunk('pollLeads', async (params: FetchLeadsParams = {}, { rejectWithValue }) => {
        try {
            const { page = 1, perPage = 10, sortField, sortOrder, search } = params;
            const effectivePage = search ? 1 : page;
            const response = await apiClient.get(endpoints.pollLeadsApi, {
                params: { page:effectivePage, per_page: perPage, sort_field: sortField, sort_order: sortOrder, search: search },
            });
            console.log(response.data.data);
            return {
                data: response.data.data,
                agents: response.data.agents || [],
                total: response.data.total,
                last_page: response.data.last_page,
                current_page: response.data.current_page,
                per_page: response.data.per_page, 
            };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    });

    export const closeleads = createAsyncThunk('closeleads', async (params: FetchLeadsParams = {}, { rejectWithValue }) => {
        try {
            const { page = 1, perPage = 10, sortField, sortOrder, search } = params;
            const effectivePage = search ? 1 : page;
            const response = await apiClient.get(endpoints.closeLeadsApi, {
                params: { page:effectivePage, per_page: perPage, sort_field: sortField, sort_order: sortOrder, search: search },
            });
            return {
                data: response.data.data,
                agents: response.data.agents || [],
                total: response.data.total,
                last_page: response.data.last_page,
                current_page: response.data.current_page,
                per_page: response.data.per_page, 
            };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    });

    export const allLeads = createAsyncThunk('allLeads', async (params: FetchLeadsParams = {}, { rejectWithValue }) => {
        try {
            const { page = 1, perPage = 10, sortField, sortOrder, search, date_range, agent_id, status_id, campaign_id  } = params;
            const effectivePage = search ? 1 : page;
            const response = await apiClient.get(endpoints.allLeadsApi, 
                { params: { 
                    page: effectivePage, 
                    per_page: perPage, 
                    sort_field: sortField, 
                    sort_order: sortOrder, 
                    search: search,
                    date_range: date_range,
                    agent_id : agent_id, 
                    status_id: status_id,
                    campaign_id: campaign_id
                },
            });
            return {
                data: response.data.leads.data, 
                agents: response.data.agents,  
                statuses: response.data.statuses,
                total: response.data.leads.total,
                total_leads: response.data.total_leads,
                last_page: response.data.leads.last_page,
                current_page: response.data.leads.current_page,
                per_page: response.data.leads.per_page,
            };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    });

    // export const download = createAsyncThunk('download', async ({ formData }: { formData: FormData; }, { rejectWithValue }) => {
    //     try {
    //         const response = await apiClient.post(endpoints.pdfurl, formData);
    //         return {data: response?.data.data, status: response?.status, agent_name:response?.data.agent_name};
    //     } catch (error: any) {
    //         return rejectWithValue(error.response?.data || error.message);
    //     }
    // });

     export const download = createAsyncThunk('download', async (params: { formData?: FormData; cityname?: string }, { rejectWithValue }) => {
        try {
            const { formData, cityname } = params;
            const response = await apiClient.post(endpoints.pdfurl, formData, {
                params: { cityname }, 
            });
            return {
                data: response?.data.data,
                status: response?.status,
                agent_name: response?.data.agent_name,
            };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
    );

    export const leadcampaignreport = createAsyncThunk('leadcampaignreport', async ({ formData }: { formData: FormData }, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.LeadCampaignReportUrl, formData, {
                responseType: 'blob', 
            });
            const file = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(file);
            return { blobUrl: url, status: response.status };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    });


    export const summaryreport = createAsyncThunk('summaryreport', async ({ formData }: { formData: FormData }, { rejectWithValue }) => {
            try {
                const response = await apiClient.post(endpoints.LeadSummaryReportUrl, formData, {
                    responseType: 'blob', 
                });
                const file = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(file);
                return { blobUrl: url, status: response.status };
            } catch (error: any) {
                return rejectWithValue(error.response?.data || error.message);
            }
        }
    );

    export const roadshowleads = createAsyncThunk('roadshowleads', async (params: FetchLeadsParams & { cityname?: string }, { rejectWithValue }) => {
        try {
            const { page = 1, perPage = 10, sortField, sortOrder, search, cityname } = params;
            const effectivePage = search ? 1 : page;
            const endpoint = cityname ? `${endpoints.roadshowLeadApi}/${cityname}` : endpoints.roadshowLeadApi;
            const response = await apiClient.get(endpoint, {
                params: { page: effectivePage, per_page: perPage, sort_field: sortField, sort_order: sortOrder, search: search, cityname: cityname },
            });
            return {
                data: response.data.data,
                total: response.data.data.total,
                last_page: response.data.data.last_page,
                current_page: response.data.data.current_page,
                per_page: response.data.data.per_page,
            };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error.message);
        }
    });

    export const updateLeadsStatus = createAsyncThunk('updateStatus', async (payload: { agent_id: any,  lead_ids: any[], status_id: any,  date_range: any, type: string }, { rejectWithValue }) => {
        try {
            if(payload.type === 'take') {
                const response = await apiClient.post(endpoints.takebackleads, payload);
                return response.data;
            }
            else {
                const response = await apiClient.post(endpoints.takePollleads, payload);
                return response.data;
            }
        } catch (error) {
            return rejectWithValue((error as any).response?.data);
        }
    });

    export const moveleadtocold = createAsyncThunk('moveleadtocold', async (payload: { lead_ids: any[], status_id: any, }, { rejectWithValue }) => {
        try {
            const response = await apiClient.post(endpoints.moveleadtocold, payload);
            return response.data;
        } catch (error) {
            return rejectWithValue((error as any).response?.data);
        }
    });

    const LeadsSlice = createSlice({
        name: 'Leads',
        initialState,
        reducers: {
            setLeads() {},
        },
        extraReducers: (builder) => {
        builder
            .addCase(newleads.pending, (state) => {
                state.loading = true;
            })
            .addCase(newleads.fulfilled, (state, action) => {
                state.loading      = false;
                state.leads        = action.payload.data;
                state.agents       = action.payload.agents;
                state.total        = action.payload.total;
                state.last_page    = action.payload.last_page;
                state.current_page = action.payload.current_page;
                state.per_page     = action.payload.per_page;
            })
            .addCase(newleads.rejected, (state, action) => {
                state.loading = false;
                state.message = action.payload as string;
            })
            .addCase(destoryLeads.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(destoryLeads.fulfilled, (state, action) => {
                state.loading = false;
                state.status  = action.payload.status;  
            })
            .addCase(reassigleads.pending, (state) => {
                state.loading = true;
            })
            .addCase(reassigleads.fulfilled, (state, action) => {
                state.loading      = false;
                state.leads        = action.payload.data;
                state.agents       = action.payload.agents;
                state.total        = action.payload.total;
                state.last_page    = action.payload.last_page;
                state.current_page = action.payload.current_page;
                state.per_page     = action.payload.per_page;
            }).addCase(closeleads.pending, (state) => {
                state.loading = true;
            }).addCase(closeleads.fulfilled, (state, action) => {
                state.loading      = false;
                state.leads        = action.payload.data;
                state.total        = action.payload.total;
                state.last_page    = action.payload.last_page;
                state.current_page = action.payload.current_page;
                state.per_page     = action.payload.per_page;
            }).addCase(pollLeads.pending, (state) => {
                state.loading = true;
            }).addCase(pollLeads.fulfilled, (state, action) => {
                state.loading      = false;
                state.leads        = action.payload.data;
                state.agents       = action.payload.agents;
                state.total        = action.payload.total;
                state.last_page    = action.payload.last_page;
                state.current_page = action.payload.current_page;
                state.per_page     = action.payload.per_page;
            }).addCase(allLeads.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(allLeads.fulfilled, (state, action) => {
                
                state.loading      = false;
                state.leads        = action.payload.data;
                state.agents       = action.payload.agents;
                state.statuses      = action.payload.statuses;
                state.total_leads   = action.payload.total_leads;
                state.total        = action.payload.total;
                state.last_page    = action.payload.last_page;
                state.current_page = action.payload.current_page;
                state.per_page     = action.payload.per_page;
            })
            .addCase(download.pending, (state) => {
                state.loading = true;
            })
            .addCase(download.fulfilled, (state, action) => {
                state.loading      = false;
                state.leads        = action.payload.data;
                state.agent_name   = action.payload.agent_name;
            })
            .addCase(summaryreport.pending, (state) => {
                state.loading = true;
            })
            .addCase(summaryreport.fulfilled, (state, action) => {
                state.loading      = false;
                // state.leads        = action.payload.data;
                // state.agent_name   = action.payload.agent_name;
            })

            .addCase(roadshowleads.pending, (state) => {
                state.loading      = true;
            })
            .addCase(roadshowleads.fulfilled, (state, action) => {
                state.loading      = false;
                state.leads        = action.payload.data.data;
                state.total        = action.payload.total;
                state.last_page    = action.payload.last_page;
                state.current_page = action.payload.current_page; 
                state.per_page     = action.payload.per_page;
            })
            .addCase(assignleads.pending, (state) => {
                state.loading = true;
            })
            .addCase(assignleads.fulfilled, (state, action) => {
                state.loading = false;
                state.leads   = action.payload.data;
            })
            .addCase(updateLeadsStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateLeadsStatus.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateLeadsStatus.rejected, (state) => {
                state.loading = false;
            })
            .addCase(moveleadtocold.pending, (state) => {
                state.loading = true;
            })
            .addCase(moveleadtocold.fulfilled, (state, action) => {
                state.loading = false;
                state.leads   = action.payload.data;
            })
            
        },
    })
export const { setLeads } = LeadsSlice.actions;
export default LeadsSlice.reducer;