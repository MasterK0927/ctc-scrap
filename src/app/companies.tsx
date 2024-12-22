// src/pages/companies.tsx
"use client"
import React, { useState, useEffect } from 'react';

interface CompanyData {
    name: string;
    ctc: number;
    stipend?: number;
    college: string;
}

// Define a type for the valid sort keys
type SortKey = keyof CompanyData;

export default function Companies() {
    const [companies, setCompanies] = useState<CompanyData[]>([]);
    const [sortBy, setSortBy] = useState<SortKey>('ctc');

    useEffect(() => {
        async function fetchData() {
            const res = await fetch('/api/companies');
            const data = await res.json();
            setCompanies(data);
        }
        fetchData();
    }, []);

    const handleSort = (sortKey: SortKey) => {
        setSortBy(sortKey);
        setCompanies([...companies].sort((a, b) => {
            // Ensure sorting works for both number and optional fields
            if (a[sortKey] === undefined) return 1;
            if (b[sortKey] === undefined) return -1;
            return (a[sortKey] as number) - (b[sortKey] as number);
        }));
    };

    return (
        <div>
            <h1>Companies</h1>
            <button onClick={() => handleSort('ctc')}>Sort by CTC</button>
            <button onClick={() => handleSort('stipend')}>Sort by Stipend</button>
            <ul>
                {companies.map((company, index) => (
                    <li key={index}>
                        {company.name} - CTC: {company.ctc} - Stipend: {company.stipend ?? 'N/A'} - College: {company.college}
                    </li>
                ))}
            </ul>
        </div>
    );
}
