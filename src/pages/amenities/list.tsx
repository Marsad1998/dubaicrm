import { useEffect, useState, Fragment, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, IRootState } from '../../store';
import { setPageTitle } from '../../slices/themeConfigSlice';
import IconBell from '../../components/Icon/IconBell';
import { useNavigate, Link, useParams } from 'react-router-dom';
import DashboardTable from '../../components/DashboardTable';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrash from '../../components/Icon/IconTrash';
import Swal from 'sweetalert2';
import Toast from '../../services/toast';
import Loader from '../../services/loader';
import IconPlus from '../../components/Icon/IconPlus';
import { Dialog, Transition } from '@headlessui/react';
import IconX from '../../components/Icon/IconX';
import '../Blogs/blogs.css';
import { showAmenities, destoryAmenities, storeAmenities, editAmenities } from '../../slices/amenitiesSlice';


const AmenitiesList = () => {
    const dispatch  = useDispatch<AppDispatch>();
    const navigate  = useNavigate();
    const toast     = Toast();
    const loader    = Loader();
    const [isModal, setModal] = useState(false);
    const formRef = useRef<HTMLFormElement | null>(null); 
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [paramsId, paramsSetId] = useState<any>();
    const [editData, setEditData] = useState<{ id?: number; name?: string }>({});

    useEffect(() => {
         dispatch(setPageTitle('Amenities List'));
         dispatch(showAmenities());
    }, [dispatch]);

    useEffect(() => {
        if (paramsId !== undefined) {
          dispatch(editAmenities(paramsId)).unwrap().then((response: any) => {
              if (formRef.current) {
                formRef.current.reset(); 
                const nameInput = formRef.current?.elements.namedItem('name') as HTMLInputElement;
                
                if (nameInput) {
                  nameInput.value = response.name || '';
                }
              }
            })
            .catch((error: any) => {
              console.error('Failed to fetch amenity details:', error);
            });
        }
      }, [paramsId, dispatch]);

    
    const { loading, amenities } = useSelector((state:IRootState) => state.amenitiesdata);
    
    const tableData = (Array.isArray(amenities) ? amenities : []).map((amenitie: any, index: number) => ({
        counter : index + 1,
        title   : amenitie?.name || 'Unknown',
        id      : amenitie?.id,
    }));

    const addAmenitie = (id?: number)  => {
        if (id) {
            paramsSetId(id); 
            setModal(true);
            // dispatch(editAmenities(id)).unwrap().then((response: any) => {
            //     console.log(response);
            //         setModal(true);    
            //             console.log(formRef.current);
            //         if (formRef.current) {
            //             const form = formRef.current;
            //             // form.name.value = response.name || '';
            //             // (form.querySelector('input[name="name"]') as HTMLInputElement).value = response.name || '';
            //         }
            //     })
            //     .catch((error: any) => {
            //         console.error('Failed to fetch amenity details:', error);
            //     });
        } else {
            setModal(true);
            if (formRef.current) {
            formRef.current.reset();
        }
        }
    };



    


    useEffect(() => {
        // alert(paramsId);

    })



    const handelDistory = (event:number) : void => {
        const id = event;
        Swal.fire({
            html: 'Are you sure you want to delete this project?',
            showCancelButton: true,
            confirmButtonText: 'Delete',
        }).then((result) => {
            if (result.isConfirmed) {
                 dispatch(destoryAmenities(id)).unwrap().then((res) => {
                    toast.success('Delete Successfully');
                })
                .catch((error:any) => {
                    Swal.fire('Error!', 'Failed to delete the blog.', 'error');
                });
            }
        });
    } 

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formRef.current){
            const formData = new FormData(formRef.current);
            try {
                const response = await dispatch(storeAmenities({ formData, id: Number(paramsId) }) as any);
                if (response.payload.status == 201 || response.payload.status == 200){
                    toast.success('Amentites Create Successfully');
                    formRef.current?.reset();
                    setModal(false);
                }else{
                    setErrors(response.payload);
                }
            } catch (error: any) {
                console.error('Error creating/updating news:', error);
            }
        }
    }

    return(
    <div>
         <div className="panel flex items-center overflow-x-auto whitespace-nowrap p-3 text-primary relative">
             <div className="rounded-full bg-primary p-1.5 text-white ring-2 ring-primary/30 ltr:mr-3 rtl:ml-3"> <IconBell /> </div>
             <span className="ltr:mr-3 rtl:ml-3">Amenities: </span> <button onClick={() => { addAmenitie(); }} className="btn btn-primary btn-sm"> <IconPlus/>Amenities</button>
         </div>
         <div className="datatables">
            {loading ? ( loader  )   : (
                <DashboardTable title="Blog List"
                    columns={[
                        { accessor: 'counter', title: '#', sortable: true },
                        { accessor: 'title', title: 'Title', sortable: true },
                        {
                            accessor: 'actions',
                            title: 'Actions',
                            render: (record) => (
                              <div className="flex items-center space-x-2">
                                 <button type="button" onClick={() => addAmenitie(record.id)} className="btn btn-warning w-6 h-6 p-0 rounded-full"> <IconPencil className="w-3 h-3 shrink-0" /></button>
                                 <button type="button" onClick={() => handelDistory(record.id)} className="btn btn-danger w-6 h-6 p-0 rounded-full"> <IconTrash className="w-3 h-3 shrink-0" /></button>
                              </div>
                            ),
                        },
                    ]} 
                    rows={tableData}
                    />
                )}
            </div>
            <Transition appear show={isModal} as={Fragment}>
                <Dialog as="div" open={isModal} onClose={() => setModal(false)} className="relative z-[51]">
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </Transition.Child>
                    <div className="fixed inset-0 z-[999] px-4 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg text-black dark:text-white-dark">
                                    <button type="button" onClick={() => setModal(false)} className="absolute top-4 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-600 outline-none"> <IconX />
                                    </button>
                                    <div className="text-lg font-medium bg-[#fbfbfb] dark:bg-[#121c2c] ltr:pl-5 rtl:pr-5 py-3 ltr:pr-[50px] rtl:pl-[50px]">
                                        {/* {params.id ? 'Edit Project' : 'Add Project'} */}   Add Amenitie
                                    </div>
                                    <div className="p-5">
                                        <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">
                                            <div className="grid gap-5">
                                                <div>
                                                    <label htmlFor="title">Amenitie Name</label>
                                                    {/* value={editData?.name || ''}  onChange={(e) => setEditData({ ...editData, name: e.target.value })} */}
                                                    <input id="name" name="name" type="text" className="form-input mt-1" placeholder="Amenitie Name"/>
                                                    {errors?.name && <p className="text-danger error">{errors.name[0]}</p>}
                                                </div>
                                            </div>
                                            <div className="flex justify-end items-center mt-8">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                    {/* {params.id ? 'Update' : 'Add'} */}  Add
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
    </div>

    );


}   


export default AmenitiesList;