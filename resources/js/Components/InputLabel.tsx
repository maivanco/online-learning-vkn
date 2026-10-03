import { LabelHTMLAttributes } from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    required = false,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string; required?: boolean }) {
    return (
        <label {...props} className={`block font-medium text-sm text-stone-700 ` + className}>
            {value ? value : children}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
    );
}
