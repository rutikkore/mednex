import { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { useAuth } from './useAuth';

export function useHospital() {
    const { user } = useAuth();
    const [hospitalId, setHospitalId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role === 'patient') {
            setHospitalId(null);
            setLoading(false);
            return;
        }

        // Try to get from local storage specific to this user
        const stored = localStorage.getItem(`mednexus_staff_hospital_${user.id}`);
        if (stored) {
            setHospitalId(stored);
        }
        setLoading(false);

        const handleHospitalChanged = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail?.userId === user.id) {
                setHospitalId(customEvent.detail.hospitalId);
            }
        };
        
        window.addEventListener('hospital_changed', handleHospitalChanged);
        return () => window.removeEventListener('hospital_changed', handleHospitalChanged);
    }, [user]);

    const setAssignedHospital = (id: string | null) => {
        setHospitalId(id);
        if (user && id) {
            localStorage.setItem(`mednexus_staff_hospital_${user.id}`, id);
            window.dispatchEvent(new CustomEvent('hospital_changed', { detail: { userId: user.id, hospitalId: id } }));
        } else if (user && !id) {
            localStorage.removeItem(`mednexus_staff_hospital_${user.id}`);
            window.dispatchEvent(new CustomEvent('hospital_changed', { detail: { userId: user.id, hospitalId: null } }));
        }
    };

    return { hospitalId, setHospitalId: setAssignedHospital, loading };
}
