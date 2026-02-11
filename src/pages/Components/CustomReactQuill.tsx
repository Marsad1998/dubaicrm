import React, { forwardRef, useImperativeHandle, useRef, Ref } from 'react';
import ReactQuill, { ReactQuillProps } from 'react-quill';

// Add this component inside your CreateListing component file
const CustomReactQuill = forwardRef((props: ReactQuillProps, ref: Ref<any>) => {
  const quillRef = useRef<ReactQuill>(null);
  
  useImperativeHandle(ref, () => ({
    getEditor: () => quillRef.current?.getEditor(),
    getValue: () => quillRef.current?.value || '',
  }));

  return <ReactQuill ref={quillRef} {...props} />;
});

CustomReactQuill.displayName = 'CustomReactQuill';