// import { PropsWithChildren, useEffect, useState, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { Link, useNavigate } from 'react-router-dom';
// import { setPageTitle, toggleRTL } from '../../slices/themeConfigSlice';
// import { AppDispatch, IRootState } from '../../store';
// import store from '../../store';
// import IconMail from '../../components/Icon/IconMail';
// import IconLockDots from '../../components/Icon/IconLockDots';
// import IconInstagram from '../../components/Icon/IconInstagram';
// import IconFacebookCircle from '../../components/Icon/IconFacebookCircle';
// import IconGoogle from '../../components/Icon/IconGoogle';
// import { loginUser } from '../../slices/authSlice';
// import Toast from '../../services/toast';
// import Swal from 'sweetalert2';
// import IconEye from '../../components/Icon/IconEye';

// const LoginCover = ({ children }: PropsWithChildren) => {
//     const isAuthenticatedd = useSelector((state: IRootState) => state.auth.isAuthenticated);
//     const dispatch = useDispatch<AppDispatch>();
//     const navigate = useNavigate();
//     const formRef = useRef<any>(null);
//     const [errors, setErrors] = useState<Record<string, string[]>>({});
//     const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
//     const themeConfig = useSelector((state: IRootState) => state.themeConfig);
//     const [showPassword, setShowPassword] = useState(false);
    
//     const toast = Toast();
//     useEffect(() => {
//         dispatch(setPageTitle('Login Cover'));
//         if (isAuthenticatedd) {
//             navigate('/'); 
//         }
//     }, [isAuthenticatedd]);

//     const setLocale = (flag: string) => {
//         setFlag(flag);
//         if (flag.toLowerCase() === 'ae') {
//             dispatch(toggleRTL('rtl'));
//         } else {
//             dispatch(toggleRTL('ltr'));
//         }
//     };
//     const [flag, setFlag] = useState(themeConfig.locale);
//     const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         if (!formRef.current) return; 
//         const formData = new FormData(formRef.current);
//         try {
//             const response = await dispatch(loginUser({ formData }) as any);
//             if ([200, 201].includes(response.payload.status)) {
//                 toast.success(response.payload.message);
//                 if (formRef.current) formRef.current.reset();
//                 navigate('/'); 
//                 return
//             }else if([401, 400].includes(response.payload.status)){
//                 toast.error(response.payload.message);
//                 if (formRef.current) {
//                     const emailInput = formRef.current.querySelector('input[name="client_user_email"]') as HTMLInputElement;
//                     const passwordInput = formRef.current.querySelector('input[name="password"]') as HTMLInputElement;
//                     if (response.payload.message.status === "Incorrect-Password" && passwordInput) {
//                         passwordInput.value = "";
//                         return
//                     }
//                     if (response.payload.message.client_user_email === "Incorrect-Email" && emailInput) {
//                         emailInput.value = "";
//                         return
//                     }
//                 }
//                 if (formRef.current) formRef.current.reset();
//                 return
//             } else {

//                 setErrors(response.payload.data);
//                 if (formRef.current) formRef.current.reset();
//             }
//         } catch (error: any) {
//             Swal.fire('Error:', error.message || error);
//         }
//     };  

//     const HandleSoicalLogin = () => {
//         toast.error('Work is in progress for the social icon login.');
//     }
//     return (
//         <div>
//             <div className="absolute inset-0">
//                 <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" />
//             </div>
//             <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
//                 <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
//                 <img src="/assets/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
//                 <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
//                 <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" />
//                 <div className="relative flex w-full max-w-[1502px] flex-col justify-between overflow-hidden rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 lg:min-h-[758px] lg:flex-row lg:gap-10 xl:gap-0">
//                     <div className="relative hidden w-full items-center justify-center bg-[linear-gradient(225deg,#914c39,#d69984)] p-5 lg:inline-flex lg:max-w-[835px] xl:-ms-28 ltr:xl:skew-x-[14deg] rtl:xl:skew-x-[-14deg]">
//                         <div className="absolute inset-y-0 w-8 from-primary/10 via-transparent to-transparent ltr:-right-10 ltr:bg-gradient-to-r rtl:-left-10 rtl:bg-gradient-to-l xl:w-16 ltr:xl:-right-20 rtl:xl:-left-20"></div>
//                         <div className="ltr:xl:-skew-x-[14deg] rtl:xl:skew-x-[14deg]">
//                             <Link to="/" className="w-48 block lg:w-72 ms-10 text-white">
//                                 Evernest Real Estate
//                             </Link>
//                             <div className="mt-24 hidden w-full max-w-[430px] lg:block">
//                                 <img src="/assets/images/auth/login.png" alt="Cover Image" className="w-full" />
//                             </div>
//                         </div>
//                     </div>
//                     <div className="relative flex w-full flex-col items-center justify-center gap-6 px-4 pb-16 pt-6 sm:px-6 lg:max-w-[667px]">
//                         <div className="flex w-full max-w-[440px] items-center gap-2 lg:absolute lg:end-6 lg:top-6 lg:max-w-full">
//                             <Link to="/" className="w-8 block lg:hidden">
//                                 <img src="/assets/images/logo.svg" alt="Logo" className="mx-auto w-10" />
//                             </Link>
//                         </div>
//                         <div className="w-full max-w-[440px] lg:mt-16">
//                             <div className="mb-10">
//                                 <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Sign in</h1>
//                                 <p className="text-base font-bold leading-normal text-white-dark">Enter your email and password to login</p>
//                             </div>
//                             <form encType="multipart/form-data" className="space-y-5 dark:text-white" onSubmit={submitForm} ref={formRef}>
//                                 <div>
//                                     <label htmlFor="Email">Email</label>
//                                     <div className="relative text-white-dark">
//                                         <input id="Email" type="email" name="client_user_email" placeholder="Enter Email" className="form-input ps-10 placeholder:text-white-dark"
//                                         />
//                                         <span className="absolute start-4 top-1/2 -translate-y-1/2">
//                                             <IconMail fill={true} />
//                                         </span>
//                                     </div>
//                                     {errors?.client_user_email && <p className="text-danger error">{errors.client_user_email[0]}</p>}
//                                 </div>
//                                 <div>
//                                 <label htmlFor="Password">Password</label>
//                                 <div className="relative text-white-dark">
//                                     <input 
//                                         id="Password" 
//                                         type={showPassword ? "text" : "password"} 
//                                         name="password" 
//                                         placeholder="Enter Password" 
//                                         className="form-input ps-10 placeholder:text-white-dark pr-10" 
//                                     />
//                                     <span className="absolute start-4 top-1/2 -translate-y-1/2">
//                                         <IconLockDots fill={true} />
//                                     </span>
//                                     <button 
//                                         type="button" 
//                                         className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 focus:outline-none"
//                                         onClick={() => setShowPassword(!showPassword)}
//                                         aria-label={showPassword ? "Hide password" : "Show password"}
//                                     >
//                                         <div className="relative h-5 w-5">
//                                             <IconEye className={`h-5 w-5 transition-opacity ${showPassword ? 'opacity-100' : 'opacity-100'}`} />
//                                             {!showPassword && (
//                                                 <div className="absolute inset-0 flex items-center justify-center">
//                                                     <div className="h-px w-5 bg-gray-400 rotate-45 transform origin-center"></div>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </button>
//                                 </div>
//                                 {errors?.password && <p className="text-danger error">{errors.password[0]}</p>}
//                             </div>

//                                 <button className="btn btn-primary !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">Sign in</button>
//                             </form>
//                             <div className="relative my-7 text-center md:mb-9">
//                                 <span className="absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 bg-white-light dark:bg-white-dark"></span>
//                                 <span className="relative bg-white px-2 font-bold uppercase text-white-dark dark:bg-dark dark:text-white-light">or</span>
//                             </div>
//                             <div className="mb-10 md:mb-[60px]">
//                                 <ul className="flex justify-center gap-3.5 text-white">
//                                     <li>
//                                         <Link to="#" onClick={HandleSoicalLogin} className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
//                                             style={{ background: 'linear-gradient(135deg, rgb(106 50 25) 0%, rgb(152 97 73) 100%)' }}
//                                         >
//                                             {' '}
//                                             <IconInstagram />
//                                         </Link>
//                                     </li>
//                                     <li>
//                                         <Link
//                                             to="#" onClick={HandleSoicalLogin}
//                                             className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
//                                             style={{ background: 'linear-gradient(135deg, rgb(106 50 25) 0%, rgb(152 97 73) 100%)' }}
//                                         >
//                                             {' '}
//                                             <IconFacebookCircle />{' '}
//                                         </Link>
//                                     </li>
//                                     <li>
//                                         <Link
//                                             to="#" onClick={HandleSoicalLogin}
//                                             className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
//                                             style={{ background: 'linear-gradient(135deg, rgb(106 50 25) 0%, rgb(152 97 73) 100%)' }}
//                                         >
//                                             <IconGoogle />
//                                         </Link>
//                                     </li>
//                                 </ul>
//                             </div>
//                         </div>
//                         <p className="absolute bottom-6 w-full text-center dark:text-white">© {new Date().getFullYear()}.Evernest Real Estate All Rights Reserved.</p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default LoginCover;


import { PropsWithChildren, useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, redirect, useLocation, useNavigate } from 'react-router-dom';
import { setPageTitle, toggleRTL } from '../../slices/themeConfigSlice';
import { AppDispatch, IRootState } from '../../store';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';
import IconInstagram from '../../components/Icon/IconInstagram';
import IconFacebookCircle from '../../components/Icon/IconFacebookCircle';
import IconGoogle from '../../components/Icon/IconGoogle';
import { loginUser, fetchGoogleAuthUrl,handleGoogleCallback } from '../../slices/authSlice';
import Toast from '../../services/toast';
import Swal from 'sweetalert2';
import IconEye from '../../components/Icon/IconEye';

const LoginCover = () => {
    const isAuthenticated = useSelector((state: IRootState) => state.auth.isAuthenticated);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const formRef = useRef<HTMLFormElement>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [showPassword, setShowPassword] = useState(false);
    const [googleAuthUrl, setGoogleAuthUrl] = useState('');
    const location = useLocation();
    const toast = Toast();
    const [flag, setFlag] = useState(themeConfig.locale);
    const ranOnce = useRef(false);

    useEffect(() => {
        if (ranOnce.current) return;
        dispatch(setPageTitle('Login Cover'));
        const queryParams = new URLSearchParams(location.search);
        const googleToken = queryParams.get('token');
        const googleUserData = queryParams.get('user');
        if (googleToken && googleUserData) {
            dispatch(handleGoogleCallback({ token: googleToken, user: googleUserData })).unwrap() 
                .then(() => {
                    navigate('/', {  replace: true, state: { from: location }  });
                })
                .catch((error) => {
                    console.error('Google login error:', error);
                    toast.error(error.message || 'Google login failed');
                    navigate('/auth/cover-login', { replace: true });
                });
        }

        if (!googleAuthUrl) {
            dispatch(fetchGoogleAuthUrl()).unwrap().then((url) => {
                    setGoogleAuthUrl(url);
                }).catch((error) => {
                    toast.error('Failed to initialize Google login');
                });
        }
        ranOnce.current = true;
    }, [dispatch, location, navigate, googleAuthUrl]);



    // Memoized functions
    const setLocale = (flag: string) => { setFlag(flag);
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };

    const initiateGoogleLogin = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        localStorage.removeItem('permissions');
        localStorage.removeItem('role');
        if (!googleAuthUrl) { 
            toast.error('Google login is not ready yet. Please try again.'); return; 
        }
        window.location.href = googleAuthUrl;
    };

    const handleSocialLogin = () => {
        toast.error('Social login is currently under development.');
    };

    const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formRef.current) return;
        const formData = new FormData(formRef.current);
        try {
            const response = await dispatch(loginUser({ formData }) as any);
            if ([200, 201].includes(response.payload.status)) {
                toast.success(response.payload.message);
                formRef.current?.reset();
                navigate('/');
                return;
            }

            if ([401, 400].includes(response.payload.status)) {
                toast.error(response.payload.message);
                const form = formRef.current;
                if (!form) return;
                const emailInput = form.querySelector<HTMLInputElement>('input[name="client_user_email"]');
                const passwordInput = form.querySelector<HTMLInputElement>('input[name="password"]');
                if (response.payload.message.status === "Incorrect-Password" && passwordInput) {
                    passwordInput.value = "";
                }
                if (response.payload.message.client_user_email === "Incorrect-Email" && emailInput) {
                    emailInput.value = "";
                }
                form.reset();
                return;
            }

            setErrors(response.payload.data);
            formRef.current?.reset();
        } catch (error: any) {
            Swal.fire('Error:', error.message || error);
        }
    };

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="background" className="h-full w-full object-cover" />
            </div>
            
            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                {/* Background decorative elements */}
                <img src="/assets/images/auth/coming-soon-object1.png" alt="decoration" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                <img src="/assets/images/auth/coming-soon-object2.png" alt="decoration" className="absolute left-24 top-0 h-40 md:left-[30%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="decoration" className="absolute right-0 top-0 h-[300px]" />
                <img src="/assets/images/auth/polygon-object.svg" alt="decoration" className="absolute bottom-0 end-[28%]" />
                
                {/* Main content container */}
                <div className="relative flex w-full max-w-[1502px] flex-col justify-between overflow-hidden rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 lg:min-h-[758px] lg:flex-row lg:gap-10 xl:gap-0">
                    {/* Left side - Branding */}
                    <div className="relative hidden w-full items-center justify-center bg-[linear-gradient(225deg,#914c39,#d69984)] p-5 lg:inline-flex lg:max-w-[835px] xl:-ms-28 ltr:xl:skew-x-[14deg] rtl:xl:skew-x-[-14deg]">
                        <div className="absolute inset-y-0 w-8 from-primary/10 via-transparent to-transparent ltr:-right-10 ltr:bg-gradient-to-r rtl:-left-10 rtl:bg-gradient-to-l xl:w-16 ltr:xl:-right-20 rtl:xl:-left-20"></div>
                        <div className="ltr:xl:-skew-x-[14deg] rtl:xl:skew-x-[14deg]">
                            <Link to="/" className="w-48 block lg:w-72 ms-10 text-white">
                                Evernest Real Estate
                            </Link>
                            <div className="mt-24 hidden w-full max-w-[430px] lg:block">
                                <img src="/assets/images/auth/login.png" alt="Login illustration" className="w-full" />
                            </div>
                        </div>
                    </div>
                    <div className="relative flex w-full flex-col items-center justify-center gap-6 px-4 pb-16 pt-6 sm:px-6 lg:max-w-[667px]">
                        <div className="flex w-full max-w-[440px] items-center gap-2 lg:absolute lg:end-6 lg:top-6 lg:max-w-full">
                            <Link to="/" className="w-8 block lg:hidden">
                                <img src="/assets/images/logo.svg" alt="Logo" className="mx-auto w-10" />
                            </Link>
                        </div>
                        <div className="w-full max-w-[440px] lg:mt-16">
                            <div className="mb-10">
                                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">Sign in</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">Enter your email and password to login</p>
                            </div>
                            <form encType="multipart/form-data" className="space-y-5 dark:text-white" onSubmit={submitForm} ref={formRef}>
                                <div>
                                    <label htmlFor="Email">Email</label>
                                    <div className="relative text-white-dark">
                                        <input id="Email" type="email" name="client_user_email" placeholder="Enter Email" className="form-input ps-10 placeholder:text-white-dark"required
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconMail fill={true} />
                                        </span>
                                    </div>
                                    {errors?.client_user_email && <p className="text-danger error">{errors.client_user_email[0]}</p>}
                                </div>
                                
                                {/* Password field */}
                                <div>
                                    <label htmlFor="Password">Password</label>
                                    <div className="relative text-white-dark">
                                        <input 
                                            id="Password" 
                                            type={showPassword ? "text" : "password"} 
                                            name="password" 
                                            placeholder="Enter Password" 
                                            className="form-input ps-10 placeholder:text-white-dark pr-10"
                                            required
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                            <IconLockDots fill={true} />
                                        </span>
                                        <button 
                                            type="button" 
                                            className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 focus:outline-none"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            <div className="relative h-5 w-5">
                                                <IconEye className={`h-5 w-5 transition-opacity ${showPassword ? 'opacity-100' : 'opacity-100'}`} />
                                                {!showPassword && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="h-px w-5 bg-gray-400 rotate-45 transform origin-center"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                    {errors?.password && <p className="text-danger error">{errors.password[0]}</p>}
                                </div>

                                <button type="submit" className="btn btn-primary !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                                    Sign in
                                </button>
                            </form>
                            
                            {/* Social login divider */}
                            <div className="relative my-7 text-center md:mb-9">
                                <span className="absolute inset-x-0 top-1/2 h-px w-full -translate-y-1/2 bg-white-light dark:bg-white-dark"></span>
                                <span className="relative bg-white px-2 font-bold uppercase text-white-dark dark:bg-dark dark:text-white-light">or</span>
                            </div>
                            
                            {/* Social login buttons */}
                            <div className="mb-10 md:mb-[60px]">
                                <ul className="flex justify-center gap-3.5 text-white">
                                    <li>
                                        <button onClick={handleSocialLogin} className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                            style={{ background: 'linear-gradient(135deg, rgb(106 50 25) 0%, rgb(152 97 73) 100%)' }}
                                        >
                                            <IconInstagram />
                                        </button>
                                    </li>
                                    <li>
                                        <button onClick={handleSocialLogin}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                            style={{ background: 'linear-gradient(135deg, rgb(106 50 25) 0%, rgb(152 97 73) 100%)' }}
                                        >
                                            <IconFacebookCircle />
                                        </button>
                                    </li>
                                    <li>
                                        <button  onClick={initiateGoogleLogin}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full p-0 transition hover:scale-110"
                                           style={{ 
                                                    background: 'linear-gradient(135deg, rgb(106 50 25) 0%, rgb(152 97 73) 100%)', 
                                                    cursor: googleAuthUrl ? 'pointer' : 'not-allowed',
                                                    opacity: googleAuthUrl ? 1 : 0.7
                                                }}
                                            disabled={!googleAuthUrl}
                                        >
                                            <IconGoogle />
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <p className="absolute bottom-6 w-full text-center dark:text-white">
                            © {new Date().getFullYear()} Evernest Real Estate. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginCover;
