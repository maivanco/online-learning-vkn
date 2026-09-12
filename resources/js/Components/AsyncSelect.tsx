import { useState, useEffect, useCallback } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import debounce from 'lodash/debounce';
import axios from 'axios';

interface Option {
    id: number | string;
    name: string;
    [key: string]: any;
}

interface Props {
    label?: string;
    placeholder?: string;
    loadOptions: (query: string) => Promise<Option[]>;
    onChange: (selected: Option[]) => void;
    selectedOptions: Option[];
    multiple?: boolean;
}

export default function AsyncSelect({
    label,
    placeholder = 'Search...',
    loadOptions,
    onChange,
    selectedOptions,
    multiple = true,
}: Props) {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<Option[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const debouncedLoad = useCallback(
        debounce(async (searchQuery: string) => {
            setIsLoading(true);
            try {
                const results = await loadOptions(searchQuery);
                setOptions(results);
            } catch (error) {
                console.error('Error loading options:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300),
        [loadOptions]
    );

    useEffect(() => {
        debouncedLoad(query);
    }, [query, debouncedLoad]);

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <Combobox value={selectedOptions} onChange={(value) => onChange(value as Option[])} multiple={multiple as any}>
                <div className="relative mt-1">
                    <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                        <Combobox.Input
                            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                            displayValue={(selected: any) =>
                                Array.isArray(selected)
                                    ? selected.map((o: Option) => o.name).join(', ')
                                    : (selected as Option)?.name || ''
                            }
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={placeholder}
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </Combobox.Button>
                    </div>
                    <Transition
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                        afterLeave={() => setQuery('')}
                    >
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                            {isLoading ? (
                                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                    Loading...
                                </div>
                            ) : options.length === 0 && query !== '' ? (
                                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                    Nothing found.
                                </div>
                            ) : (
                                options.map((option) => (
                                    <Combobox.Option
                                        key={option.id}
                                        className={({ active }) =>
                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                active ? 'bg-blue-600 text-white' : 'text-gray-900'
                                            }`
                                        }
                                        value={option}
                                    >
                                        {({ selected, active }) => (
                                            <>
                                                <span
                                                    className={`block truncate ${
                                                        selected ? 'font-medium' : 'font-normal'
                                                    }`}
                                                >
                                                    {option.name}
                                                </span>
                                                {selected ? (
                                                    <span
                                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                            active ? 'text-white' : 'text-blue-600'
                                                        }`}
                                                    >
                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Combobox.Option>
                                ))
                            )}
                        </Combobox.Options>
                    </Transition>
                </div>
            </Combobox>
        </div>
    );
}
