import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Assuming you're using axios
import Toast from '../../services/toast';
import apiClient from '../../utils/apiClient';

interface PermissionData {
    id: number;
    name: string;
    counter: number;
}

const AssignPermission = () => {
    const [roles, setRoles] = useState<any[]>([]);
    const [allAgents, setAllAgents] = useState<any[]>([]);
    const [dataSource, setDataSource] = useState<PermissionData[]>([]);
    const [checkedItems, setCheckedItems] = useState<number[]>([]);
    const combinedRef = useRef<any>({ userformRef: null });
    const toast = Toast();
    const requestMade = useRef(false);

    useEffect(() => {
        if (!requestMade.current) {
            getRoles();
             getAgents();
            getPermissions();
            requestMade.current = true;
        }    
    }, []);

    const getRoles = async () => {
        try {
            const response = await apiClient.get('/users/get_user_role?for_select=1');
            setRoles(response.data);
        } catch (error) {
            toast.error('Failed to fetch roles');
        }
    };

    const getAgents = async () => {
        try {
            // const url = forSelect ? '/users/user_list?for_select=1' : '/users/user_list';
            const response = await apiClient.get('/users/user_list?for_select=1');
            setAllAgents(response.data);
        } catch (error) {
            toast.error('Failed to fetch agents');
        }
    };

    const getPermissions = async () => {
        try {
            const response = await apiClient.get('/users/get_permissions');
            const formattedData = response.data.map((item: any, index: number) => ({
                ...item,
                counter: index + 1
            }));
            setDataSource(formattedData);
        } catch (error) {
            toast.error('Failed to fetch permissions');
        }
    };

    const handleRoleChange = async (roleId: string) => {
        combinedRef.current.userformRef.client_user_id.value = ''; 
        try {
            const response = await apiClient.get(`/users/role_permissions/${roleId}`);
            setCheckedItems(response.data);
        } catch (error) {
            toast.error('Failed to fetch role permissions');
        }
    };

    const handleAgentChange = async (userId: string) => {
        combinedRef.current.userformRef.role_id.value = ''; 
        try {
            console.log(userId);
            const response = await apiClient.get(`/users/user_permissions/${userId}`);
            setCheckedItems(response.data);
        } catch (error) {
            toast.error('Failed to fetch user permissions');
        }
    };
    
    const toggleCheckbox = (item: PermissionData) => {
        setCheckedItems(prev => {
            if (prev.includes(item.id)) {
                return prev.filter(id => id !== item.id);
            }
            return [...prev, item.id];
        });
    };

    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const formData = new FormData(combinedRef.current.userformRef);
            formData.append('permission', checkedItems.join(','));

            const response = await apiClient.post('/users/assign_permission', formData);
            if (response.data.status === 'success') {
                toast.success('Permissions assigned successfully');
                combinedRef.current.userformRef.reset();
                setCheckedItems([]);
            }
        } catch (error) {
            toast.error('Failed to assign permissions');
        }
    };
    return (
        <form ref={(el) => (combinedRef.current.userformRef = el)} onSubmit={onSubmit} className="p-6 bg-white shadow-md rounded-md">
            <div className="mb-4">
                <h2 className="text-md font-bold">Detail of all Permission</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">User-Role</label>
                    <select
                        name="role_id"
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md"
                    >
                        <option value="">Select Role</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Users</label>
                    <select name="client_user_id" onChange={(e) => handleAgentChange(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md">
                        <option value="">Select Agent</option>
                        {allAgents.map((agent) => (
                            <option key={agent.client_user_id} value={agent.client_user_id}>{agent.client_user_name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mt-6 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {dataSource.map((row, index) => (
                            index % 4 === 0 && (
                            <tr key={index}>
                                {[0, 1, 2, 3].map((offset) => {
                                const item = dataSource[index + offset];
                                return item ? (
                                    <td key={item.id} className="px-6 py-4 whitespace-nowrap">
                                        <input type="checkbox"  checked={checkedItems.includes(item.id)} onChange={() => toggleCheckbox(item)} className="mr-2 form-checkbox"/> {item.name}
                                    </td>
                                ) : <td key={offset} className="px-6 py-4 whitespace-nowrap"></td>;
                                })}
                            </tr>
                            )
                        ))}
                    </tbody>
                </table>
            </div>

            <button
                type="submit"
                disabled={!checkedItems.length}
                className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            > Assign </button>
        </form>
    );
};

export default AssignPermission;
