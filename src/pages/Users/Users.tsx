import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../slices/themeConfigSlice';
import Swal from 'sweetalert2';
import { getBaseUrl } from '../../components/BaseUrl';
import apiClient from '../../utils/apiClient';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Loader from '../../services/loader';
import { options, employeeType, documentTypes, languagesDropdown } from '../../services/status';
import Select from 'react-select';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconPencil from '../../components/Icon/IconPencil';
import Table from '../../components/Table';
import { AppDispatch } from '../../store';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import '../dashboard/dashboard.css'; 
import IconX from '../../components/Icon/IconX';
import '../../../src/assets/css/file-upload-preview.css';
import { set, setDate } from 'date-fns';
import IconEye from '../../components/Icon/IconEye';
import UserDetailModal from '../../components/UserDetailModal';


const endpoints = {
    createApi: `${getBaseUrl()}/users/create_user`,
    roleApi: `${getBaseUrl()}/users/get_user_role?for_select=1`,
    listApi: `${getBaseUrl()}/users/user_list`,
    destoryApi: `${getBaseUrl()}/users/delete_user`,
    updateApi: `${getBaseUrl()}/users/update_user`, 
};


const Users = () => {
    const dispatch = useDispatch<AppDispatch>();
    const loader = Loader();
    const combinedRef = useRef<any>({ userformRef: null });
    const [users, setUsers] = useState<any | null>([]);
    const [status, setStatus] = useState<any | null>(null);
    const [headId, setHeadId] = useState<any | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [urole, setRoles] = useState<any | null>(null);
    const [selectedRole, setSelectedRole] = useState<any | null>(null);
    const requestMade = useRef(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'client_user_id', direction: 'asc' });
    const [searchQuery, setSearchQuery] = useState('');
    const [teamHeads, setTeamHeads] = useState<any[]>([]);
    const [type, setType] = useState<any | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [birthdaydate, setDateOfBirthday] = useState<any | null>(null);
    const [joindate, SetJoingDate] = useState<any | null>(null);
    const [photo, setPhoto] = useState<any>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [languages, setLanguages] = useState<any[]>([]);


    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        if (!requestMade.current) {
            dispatch(setPageTitle('Create User'));
            fetchRoles();
            requestMade.current = true;
        }
    }, [dispatch]);

    useEffect(() => {
        fetchUserLists();
    }, [page, pageSize, sortStatus, searchQuery]);

    const fetchRoles = async () => {
        try {
            const response = await apiClient.get(endpoints.roleApi);
            if (response.data) {
                const roleOptions = response.data.map((role: any) => ({
                    value: role.id,
                    label: role.name,
                }));
                setRoles(roleOptions);
            }
        } catch (error: any) {
            if (error.response?.status === 403) {
                window.location.href = '/error';
            }
        }
    };
    
    const fetchUserLists = async (teamId = null) => {
        try {
            const params = {
                page,
                per_page: pageSize,
                sort_field: sortStatus.columnAccessor,
                sort_order: sortStatus.direction,
                search: searchQuery,
                team_id: teamId
            };
            const response = await apiClient.get(endpoints.listApi, { params });
            if (response.data) {
                const allUsers = response.data.data.data || [];
                setUsers(allUsers);
                const heads = response.data.heads || [];
                const headOptions = heads.map((head: any) => ({
                    value: head.client_user_id,
                    label: ( <> {head.client_user_name}{' '}<span className='badge bg-success rounded-full text-white ml-2'>{head.client_user_designation}</span></>)
                }));
                setTeamHeads(headOptions);
                setTotalRecords(response.data.data.total || 0);
            }
        } catch (error: any) {
            if (error.response?.status === 403) {
                window.location.href = '/error';
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (combinedRef.current.userformRef) {
                const formData = new FormData(combinedRef.current.userformRef);
                if (languages && languages.length > 0) {
                    languages.forEach((lang: any) => { if (lang && lang.value) { formData.append('client_user_languages[]', lang.value); } });
                }

                if (photo) {
                    formData.append("profile_photo", photo);
                }
                    items.forEach((item:any, index:number) => {
                        if (item.file) {
                            formData.append(`user_files[]`, item.file);
                            formData.append(`documentType[]`, item.documentType || '');
                        }
                    });
                const userId = formData.get('client_user_id');
                const response = userId? await apiClient.post(`${endpoints.createApi}/${userId}`, formData) : await apiClient.post(endpoints.createApi, formData);
                if (response.status === 200 || response.status === 201) {
                    showSuccessToast(response.data.message);
                    fetchUserLists();
                    setErrors({});
                    combinedRef.current.userformRef.reset();
                    setSelectedRole(null);
                    setStatus(null);
                    setDateOfBirthday(null);
                    SetJoingDate(null);
                    setType(null);
                    setLanguages([]);

                }
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response?.status === 403) {
                window.location.href = '/error';
            } else {
                // showServerError();
            }
        }
    };

    const showSuccessToast = (message: string) => {
        Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            title: message,
            icon: 'success',
        });
    };

    const showServerError = () => {
        Swal.fire({
            text: 'Something went wrong on the server',
            icon: 'error',
            title: 'Server Errors',
        });
    };

    const handleEdit = async (user: any) => {
        if (combinedRef.current.userformRef) {
            const form = combinedRef.current.userformRef;
            form.reset();
            form.client_user_id.value = user.client_user_id || '';
            form.client_user_name.value = user.client_user_name || '';
            form.client_user_email.value = user.client_user_email || '';
            form.client_user_phone.value = user.client_user_phone || '';
            form.client_user_designation.value = user.client_user_designation || '';
            form.client_sort_order.value = user.client_sort_order || '';
            form.client_user_allow_leave.value = user.client_user_allow_leave || '';
            setStatus(user.client_user_status || '');
            setDateOfBirthday(user.client_user_dob || null);
            SetJoingDate(user.client_user_joing_date || null);
            setType(user.client_user_type ? Number(user.client_user_type) : null);
            const userrole = user.roles && user.roles[0];
            if (userrole) {
                const selectedRole = {
                    value: userrole.id,
                    label: userrole.name,
                };
                setSelectedRole(selectedRole);
            } else {
                setSelectedRole(null);
            }
            const userTeam = user.team;
            let headOptions = [];
            if (userTeam) {
                headOptions = [{
                    value: userTeam.client_user_id,
                    label: userTeam.client_user_name + ' (' + userTeam.client_user_designation + ')',
                }];
            } else {
                headOptions = [{ value: null, label: 'No Team Head', }];
            }
            setHeadId(headOptions); 

            if (user.client_user_languages) {
                // Convert comma-separated string to array
                let langsArray: any[] = [];

                if (typeof user.client_user_languages === 'string') {
                    langsArray = user.client_user_languages.split(',').map((l: any) => l.trim());
                } else if (Array.isArray(user.client_user_languages)) {
                    langsArray = user.client_user_languages;
                }

                const userLanguages = langsArray.map((lang) => {
                    // Find the option in your languagesDropdown
                    const option = languagesDropdown.find((o) => o.value === Number(lang) || o.value === lang);
                    return option || { value: lang, label: String(lang) };
                });

                setLanguages(userLanguages);
            } else {
                setLanguages([]);
            }


        }
    };

    const handleDelete = async (user: any) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
        });
        if (result.isConfirmed) {
            try {
                const response = await apiClient.delete(endpoints.destoryApi + `/${user.client_user_id}`);
                if (response.status === 200 || response.status === 201) {
                    showSuccessToast('User deleted successfully');
                    fetchUserLists();
                }
            } catch (error: any) {
                if (error.response?.status === 403) {
                    window.location.href = '/error';
                }
            }
        }
    };

    const handleRoleChange = (selectedOption: any) => {
        setSelectedRole(selectedOption);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(1); 
    };

    const handlePageChange = (p: number) => {
        setPage(p);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);
    };

    const [items, setItems] = useState<any>([ { id: 1, file : null, documentType: null, }, ]);
    const addItem = () => {
        const lastItem = items[items.length - 1];
        if (items.length === 0) { setItems([{ id: 1, file: null, documentType: null }]); return; }
        if (!lastItem?.file || !lastItem?.documentType) {
            Swal.fire({ 
                icon: 'warning', 
                title: 'Incomplete Row', 
                text: 'Please upload a file and select a document type before adding a new row.'
            });
            return;
        }
        const maxId = items.reduce((max: number, item: any) => item.id > max ? item.id : max, 0); 
        setItems([...items, { id: maxId + 1, file: null, documentType: null }]);   };
        const removeItem = (item: any = null) => { 
            setItems(items.filter((d: any) => d.id !== item.id)); 
        };
        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, itemId: number) => {
        const file = e.target.files?.[0];
        if (file) { setItems(items.map((item:any) =>  item.id === itemId ? { ...item, file } : item )); }
    };


    const Detail = async (user: any) => {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
    };

    const handleTeamHeadChange = (selectedOption: any) => {
        setHeadId(selectedOption);
        fetchUserLists(selectedOption.value); 
    };


    const columns = [
        {
            accessor: 'client_user_id',
            title: '#',
            width: 80,
            key: 'id'
        },
        {
            accessor: 'profile_photo',
            title: 'Photo',
            width: 80,
            key: 'photo',
            render: (item: any) => {
                const photo =
                    item.media?.length > 0
                        ? item.media[0].original_url
                        : "/default-user.png"; // fallback image

                return (
                    <img
                        src={photo}
                        alt={item.client_user_name}
                        className="w-10 h-10 rounded-full object-cover border"
                    />
                );
            },
        },
        {
            accessor: 'team.client_user_name',
            title: 'Team Head',
            sortable: true,
            key: 'team_id_column'
        },

        {
            accessor: 'client_user_name',
            title: 'Name',
            sortable: true,
            key: 'client_user_name_column'
        },
        {
            accessor: 'client_user_email',
            title: 'Email',
            sortable: true,
            key: 'email-column'
        },
        {
            accessor: 'actions',
            title: 'Actions',
            width: 120,
            key: 'actions-column',
            render: (item: any) => (
                <div className="flex space-x-2">
                    <button type="button" onClick={() => Detail(item)} className="btn px-1 py-0.5 rounded text-white bg-green-600" key={`view-${item.client_user_id}`}
                    >
                        <IconEye />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="btn px-1 py-0.5 rounded text-white bg-info"
                        key={`edit-${item.client_user_id}`}
                    >
                        <IconPencil />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="btn px-1 py-0.5 rounded text-white bg-red-600"
                        key={`delete-${item.client_user_id}`}
                    >
                        <IconTrashLines />
                    </button>

                     

                </div>
            ),
        },
    ];

    return (
        <form ref={(el) => (combinedRef.current.userformRef = el)} onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-wrap -mx-4">
                <div className="w-full lg:w-1/3 px-4">
                    <div className="panel">
                        <div className="panel-body">
                              <div className="grid mb-2">
                                <div className="form-group">
                                    <label htmlFor="team_head_id">Assign Team Head</label>
                                    <Select name="team_head_id" placeholder="Select an Team" options={teamHeads || []} value={headId} onChange={handleTeamHeadChange} isClearable={true}/>
                                    {errors.team_head_id && (
                                        <span className="text-red-500 text-sm">
                                            {errors.team_head_id}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="form-group">
                                    <label htmlFor="client_user_name">Username</label>
                                    <input name="client_user_name" type="text" placeholder="Username" className="form-input" />
                                    <input type="hidden" name="client_user_id" id="client_user_id" />
                                    {errors.client_user_name && (
                                        <span className="text-red-500 text-sm">
                                            {errors.client_user_name}
                                        </span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="client_user_phone">Phone</label>
                                    <input
                                        name="client_user_phone"
                                        type="tel"
                                        placeholder="Phone"
                                        className="form-input"
                                    />
                                    {errors.client_user_phone && (
                                        <span className="text-red-500 text-sm">
                                            {errors.client_user_phone}
                                        </span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="client_user_designation">Designation</label>
                                    <input name="client_user_designation" type="text" placeholder="Designation" className="form-input" />
                                    {errors.client_user_designation && (
                                        <span className="text-red-500 text-sm">
                                            {errors.client_user_designation}
                                        </span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="client_user_email">Email</label>
                                    <input
                                        name="client_user_email"
                                        type="email"
                                        placeholder="Email"
                                        className="form-input"
                                    />
                                    {errors.client_user_email && (
                                        <span className="text-red-500 text-sm">
                                            {errors.client_user_email}
                                        </span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <input name="password" type="password" placeholder="Password" className="form-input" />
                                    {errors.password && (
                                        <span className="text-red-500 text-sm">
                                            {errors.password}
                                        </span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="client_user_status">Status</label>
                                    <Select
                                        name="client_user_status"
                                        placeholder="Select an option"
                                        options={options}
                                        value={options.find((option) => option.value === status)}
                                        onChange={(selected) => setStatus(selected?.value || null)}
                                    />
                                    {errors.client_user_status && (
                                        <span className="text-red-500 text-sm"> {errors.client_user_status} </span>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="client_sort_order">Sort Order</label>
                                    <input name="client_sort_order" type="text" placeholder="Sort Order" className="form-input" />
                                    {errors.client_sort_order && ( <span className="text-red-500 text-sm"> {errors.client_sort_order} </span> )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="role_id">Role</label>
                                    <Select name="role_id" placeholder="Select an option" options={urole || []} value={selectedRole} onChange={handleRoleChange} />
                                    {errors.role_id && ( <span className="text-red-500 text-sm"> {errors.role_id} </span> )}
                                </div>
                                </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
                                    <div className="form-group">
                                    <label htmlFor="client_user_dob">Date of Birth</label>
                                    <Flatpickr name="client_user_dob" value={birthdaydate}   options={{ dateFormat: 'Y-m-d'}} className="form-input" placeholder="Y-m-d" onChange={(dates) => { setDateOfBirthday(dates[0]); }}
                                        />
                                    {errors.client_user_dob && ( <span className="text-red-500 text-sm"> {errors.client_user_dob} </span> )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="client_user_joing_date">Joing Date</label>
                                    <Flatpickr value={joindate} options={{ dateFormat: 'Y-m-d'}} name="client_user_joing_date" className="form-input" placeholder="Y-m-d" onChange={(dates) => SetJoingDate(dates[0])}/>
                                    {errors.client_user_joing_date && (
                                        <span className="text-red-500 text-sm">
                                            {errors.client_user_joing_date}
                                        </span>
                                    )}
                                </div>
                                 <div className="form-group">
                                    <label htmlFor="client_user_type">Type</label>
                                    <Select name="client_user_type" placeholder="Employee Type" options={employeeType} value={employeeType.find((option) => option.value === type)} onChange={(selected) => setType(selected?.value || null)}
                                    />
                                    {errors.client_user_type && (
                                        <span className="text-red-500 text-sm">
                                            {errors.client_user_type}
                                        </span>
                                    )}
                                </div>

                                <div className="form-group sm:col-span-3 mt-2">
                                    <input name="client_user_allow_leave" type="number" placeholder="Allow Leave" className="form-input" />
                                    {errors.client_user_allow_leave && ( <span className="text-red-500 text-sm"> {errors.client_user_allow_leave} </span> )}
                                </div>

                                <div className="form-group sm:col-span-3 mt-2">
                                    <label htmlFor="profile_photo">Profile Photo</label>
                                    <input
                                        type="file"
                                        name="profile_photo"
                                        accept="image/*"
                                        className="form-input"
                                        onChange={handlePhotoChange}
                                    />

                                    {photoPreview && (
                                        <div className="mt-3">
                                            <img
                                                src={photoPreview}
                                                alt="Preview"
                                                className="w-32 h-32 object-cover rounded border"
                                            />
                                        </div>
                                    )}

                                    {errors.profile_photo && (
                                        <span className="text-red-500 text-sm">{errors.profile_photo}</span>
                                    )}
                                </div>

                                <div className="form-group sm:col-span-3 mt-2">
                                    <label htmlFor="client_user_languages">Languages</label>
                                    <Select

                                        options={languagesDropdown}
                                        value={languages}
                                        isMulti
                                        placeholder="Select Languages"
                                        onChange={(selected) => setLanguages(Array.isArray(selected) ? [...selected] : [])}
                                        getOptionValue={(option) => option.value}
                                        getOptionLabel={(option) => option.label}
                                    />
                                    {errors.languages && (
                                        <span className="text-red-500 text-sm">
                                            {errors.languages}
                                        </span>
                                    )}
                                </div>
                              </div>
                                <div className="mt-8">
                                    <div className="table-responsive">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>File</th>
                                                    <th className="w-1">File Name</th>
                                                    <th className="w-1"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.length <= 0 && (
                                                    <tr> <td colSpan={5} className="!text-center font-semibold"> No Item Available </td> </tr>
                                                )}
                                                {items.map((item: any) => {
                                                    return (
                                                        <tr className="align-top" key={item.id}>
                                                           <td>
                                                                <div className="relative inline-block">
                                                                    <label className="cursor-pointer inline-block bg-gray-200 text-gray-800 text-sm font-medium px-4 py-2 rounded-md shadow hover:bg-gray-300 transition min-w-[200px]">
                                                                    Upload File
                                                                    <input  type="file"  className="hidden"  onChange={(e) => handleFileChange(e, item.id)} /> 
                                                                    </label>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="relative">
                                                                    <Select placeholder="Document Type" options={documentTypes} value={documentTypes.find(opt => opt.value === item.documentType)}
                                                                        onChange={(selected) => setItems(items.map((itm: any) => 
                                                                            itm.id === item.id 
                                                                            ? { ...itm, documentType: selected?.value || null } 
                                                                            : itm
                                                                        ))}
                                                                        className="min-w-[200px]"
                                                                        menuPortalTarget={document.body}
                                                                        styles={{
                                                                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                                            menu: base => ({ ...base, zIndex: 9999 })
                                                                        }}
                                                                        />
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                <button type="button" onClick={() => removeItem(item)}> <IconX className="w-5 h-5" /> </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex justify-between sm:flex-row flex-col mt-6 px-4">
                                        <div className="sm:mb-0 mb-6">
                                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => addItem()}> + </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="sm:col-span-2 flex justify-end mt-4">
                                    <button type="submit" className="btn btn-primary"> Submit </button>
                                </div> 
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-2/3 px-2 mt-6 lg:mt-0 md-mt-0">
                     <div className="mb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {teamHeads.map((head) => {
                                const userCount = users.filter((user:any) => user.team?.client_user_id === head.value).length;
                                const designationCounts = users.reduce((acc: { [key: string]: number }, user: { team?: { client_user_id?: number }, client_user_designation: string }) => {
                                if (user.team?.client_user_id === head.value) {
                                    const designation = user.client_user_designation;
                                    acc[designation] = (acc[designation] || 0) + 1;
                                }
                                return acc;
                            }, {});
                                // const designationCounts = users.reduce((acc: {[key: string]: number}, user) => {
                                //     if (user.team?.client_user_id === head.value) { const designation = user?.client_user_designation;
                                //         acc[designation] = (acc[designation] || 0) + 1;
                                //     }
                                //     return acc;
                                // }, {});
                                return (
                                    <div key={head.value} className="panel">
                                        <div className="panel-body flex flex-col justify-between min-h-[120px]">
                                            <h5 className="font-semibold mb-2">{head.label}</h5>
                                            <div className="text-sm flex-grow">
                                                <div className="flex flex-wrap gap-2 min-h-[40px]">
                                                    {(Object.entries(designationCounts) as [string, number][]).map(([designation, count]) => (
                                                        <span key={designation} className="badge badge-info">
                                                            {designation} : {count || 0}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-right mt-2"> Total Members: <span className="bg-secondary badge">{userCount}</span></p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div> 
                    <div className="datatables">
                        <Table
                            columns={columns}
                            rows={users}
                            title="List of all Users"
                            idAccessor="client_user_id"
                            totalRecords={totalRecords}
                            currentPage={page}
                            recordsPerPage={pageSize}
                            onPageChange={handlePageChange}
                            onRecordsPerPageChange={handlePageSizeChange}
                            onSortChange={setSortStatus}
                            onSearchChange={handleSearchChange}
                            sortStatus={sortStatus}
                            isLoading={false}
                            minHeight={200}
                            noRecordsText="No users found"
                            searchValue={searchQuery}
                        />
                    </div>
                </div>
            </div>
            <UserDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}  user={selectedUser}/>

        </form>
    );
};

export default Users;
