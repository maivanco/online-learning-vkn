import React, { ReactNode } from 'react';

interface TableProps {
    thead: (string | ReactNode)[];
    tbody: ReactNode[];
}

export default function Table({ thead, tbody }: TableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {thead.map((header, index) => (
                            <th
                                key={index}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {tbody}
                </tbody>
            </table>
        </div>
    );
}
